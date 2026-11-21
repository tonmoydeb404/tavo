//! Thin wrappers over the CoreAudio HAL C API (via objc2-core-audio).
//!
//! Everything audio-touching code goes through these helpers so the unsafe
//! FFI surface stays in one file. Property get/set plus the C-function-pointer
//! listener API (simpler from Rust than the block-based variant, which needs a
//! dispatch queue).

use objc2_core_audio::{
    kAudioObjectPropertyElementMain, kAudioObjectPropertyScopeGlobal,
    kAudioObjectPropertyScopeInput, kAudioObjectPropertyScopeOutput, kAudioObjectSystemObject,
    AudioObjectAddPropertyListener, AudioObjectGetPropertyData, AudioObjectGetPropertyDataSize,
    AudioObjectID, AudioObjectIsPropertySettable, AudioObjectPropertyAddress,
    AudioObjectPropertyElement, AudioObjectPropertyListenerProc, AudioObjectPropertyScope,
    AudioObjectPropertySelector, AudioObjectRemovePropertyListener, AudioObjectSetPropertyData,
};
use objc2_core_foundation::{CFRetained, CFString};

pub type HalError = i32;

pub const SYSTEM_OBJECT: AudioObjectID = kAudioObjectSystemObject as AudioObjectID;
pub const SCOPE_GLOBAL: AudioObjectPropertyScope = kAudioObjectPropertyScopeGlobal;
pub const SCOPE_INPUT: AudioObjectPropertyScope = kAudioObjectPropertyScopeInput;
pub const SCOPE_OUTPUT: AudioObjectPropertyScope = kAudioObjectPropertyScopeOutput;
pub const ELEMENT_MAIN: AudioObjectPropertyElement = kAudioObjectPropertyElementMain;

pub const fn address(
    selector: AudioObjectPropertySelector,
    scope: AudioObjectPropertyScope,
    element: AudioObjectPropertyElement,
) -> AudioObjectPropertyAddress {
    AudioObjectPropertyAddress {
        mSelector: selector,
        mScope: scope,
        mElement: element,
    }
}

/// Get a fixed-size `Copy` property (u32, f32, AudioObjectID, CFStringRef…).
pub fn get<T: Copy>(
    object: AudioObjectID,
    selector: AudioObjectPropertySelector,
    scope: AudioObjectPropertyScope,
    element: AudioObjectPropertyElement,
) -> Result<T, HalError> {
    let addr = address(selector, scope, element);
    let mut value = std::mem::MaybeUninit::<T>::uninit();
    let mut size = std::mem::size_of::<T>() as u32;
    let status = unsafe {
        AudioObjectGetPropertyData(
            object,
            std::ptr::NonNull::from(&addr),
            0,
            std::ptr::null(),
            std::ptr::NonNull::from(&mut size),
            std::ptr::NonNull::new_unchecked(value.as_mut_ptr().cast::<std::ffi::c_void>()),
        )
    };
    if status != 0 {
        return Err(status);
    }
    // SAFETY: CoreAudio wrote `size` bytes (== size_of::<T>() on success).
    Ok(unsafe { value.assume_init() })
}

/// Get a fixed-size `Copy` property with a qualifier (e.g. PID → process
/// object translation).
pub fn get_with_qualifier<T: Copy>(
    object: AudioObjectID,
    selector: AudioObjectPropertySelector,
    scope: AudioObjectPropertyScope,
    element: AudioObjectPropertyElement,
    qualifier: &impl Copy,
) -> Result<T, HalError> {
    let addr = address(selector, scope, element);
    let mut value = std::mem::MaybeUninit::<T>::uninit();
    let mut size = std::mem::size_of::<T>() as u32;
    let status = unsafe {
        AudioObjectGetPropertyData(
            object,
            std::ptr::NonNull::from(&addr),
            std::mem::size_of_val(qualifier) as u32,
            std::ptr::from_ref(qualifier).cast::<std::ffi::c_void>(),
            std::ptr::NonNull::from(&mut size),
            std::ptr::NonNull::new_unchecked(value.as_mut_ptr().cast::<std::ffi::c_void>()),
        )
    };
    if status != 0 {
        return Err(status);
    }
    // SAFETY: CoreAudio wrote `size` bytes (== size_of::<T>() on success).
    Ok(unsafe { value.assume_init() })
}

/// Get a variable-length property as a byte buffer (device ID lists,
/// volume arrays…).
pub fn get_buffer(
    object: AudioObjectID,
    selector: AudioObjectPropertySelector,
    scope: AudioObjectPropertyScope,
    element: AudioObjectPropertyElement,
) -> Result<Vec<u8>, HalError> {
    let addr = address(selector, scope, element);
    let mut size = 0u32;
    let status = unsafe {
        AudioObjectGetPropertyDataSize(
            object,
            std::ptr::NonNull::from(&addr),
            0,
            std::ptr::null(),
            std::ptr::NonNull::from(&mut size),
        )
    };
    if status != 0 {
        return Err(status);
    }
    let mut buffer = vec![0u8; size as usize];
    let status = unsafe {
        AudioObjectGetPropertyData(
            object,
            std::ptr::NonNull::from(&addr),
            0,
            std::ptr::null(),
            std::ptr::NonNull::from(&mut size),
            std::ptr::NonNull::new_unchecked(buffer.as_mut_ptr().cast::<std::ffi::c_void>()),
        )
    };
    if status != 0 {
        return Err(status);
    }
    buffer.truncate(size as usize);
    Ok(buffer)
}

/// Get a CFString-typed property as a Rust String. CoreAudio's copy rule
/// hands us a +1 reference, which `CFRetained::from_raw` consumes.
pub fn get_string(
    object: AudioObjectID,
    selector: AudioObjectPropertySelector,
    scope: AudioObjectPropertyScope,
    element: AudioObjectPropertyElement,
) -> Result<String, HalError> {
    let raw: *const CFString = get(object, selector, scope, element)?;
    if raw.is_null() {
        return Err(-1);
    }
    // SAFETY: CoreAudio returned a retained reference; from_raw adopts it.
    let cf_string =
        unsafe { CFRetained::from_raw(std::ptr::NonNull::new_unchecked(raw.cast_mut())) };
    Ok(cf_string.to_string())
}

pub fn set<T: Copy>(
    object: AudioObjectID,
    selector: AudioObjectPropertySelector,
    scope: AudioObjectPropertyScope,
    element: AudioObjectPropertyElement,
    value: &T,
) -> Result<(), HalError> {
    let addr = address(selector, scope, element);
    let status = unsafe {
        AudioObjectSetPropertyData(
            object,
            std::ptr::NonNull::from(&addr),
            0,
            std::ptr::null(),
            std::mem::size_of::<T>() as u32,
            std::ptr::NonNull::from(value).cast::<std::ffi::c_void>(),
        )
    };
    if status == 0 {
        Ok(())
    } else {
        Err(status)
    }
}

pub fn is_settable(
    object: AudioObjectID,
    selector: AudioObjectPropertySelector,
    scope: AudioObjectPropertyScope,
    element: AudioObjectPropertyElement,
) -> bool {
    let addr = address(selector, scope, element);
    // `Boolean` is a private alias of u8 in objc2-core-foundation.
    let mut settable: u8 = 0;
    let status = unsafe {
        AudioObjectIsPropertySettable(
            object,
            std::ptr::NonNull::from(&addr),
            std::ptr::NonNull::from(&mut settable),
        )
    };
    status == 0 && settable != 0
}

/// Listener client data: a pointer to the process-wide `Watchers` (the
/// channel lives for the whole process inside `AudioState`).
pub fn add_listener(
    object: AudioObjectID,
    selector: AudioObjectPropertySelector,
    scope: AudioObjectPropertyScope,
    element: AudioObjectPropertyElement,
    listener: AudioObjectPropertyListenerProc,
    client_data: *mut std::ffi::c_void,
) -> Result<(), HalError> {
    let addr = address(selector, scope, element);
    let status = unsafe {
        AudioObjectAddPropertyListener(
            object,
            std::ptr::NonNull::from(&addr),
            listener,
            client_data,
        )
    };
    if status == 0 {
        Ok(())
    } else {
        Err(status)
    }
}

pub fn remove_listener(
    object: AudioObjectID,
    selector: AudioObjectPropertySelector,
    scope: AudioObjectPropertyScope,
    element: AudioObjectPropertyElement,
    listener: AudioObjectPropertyListenerProc,
    client_data: *mut std::ffi::c_void,
) -> Result<(), HalError> {
    let addr = address(selector, scope, element);
    let status = unsafe {
        AudioObjectRemovePropertyListener(
            object,
            std::ptr::NonNull::from(&addr),
            listener,
            client_data,
        )
    };
    if status == 0 {
        Ok(())
    } else {
        Err(status)
    }
}
