import { useEffect } from "react"

import { IconRoute } from "@tabler/icons-react"

import { EmptyState, Notice } from "@/components"
import { useAudioState } from "@/hooks/use-audio-state"
import { api } from "@/lib/api"

import {
  ActiveRoutes,
  PermissionNotice,
  PresetsList,
  RoutePicker,
  RulesList,
} from "./sections"

const PERMISSION_PREFIX = "permission-required"

function RoutingView() {
  const {
    snapshot,
    error,
    busy,
    routeApp,
    unrouteApp,
    setRouteVolume,
    stopAllRouting,
    addRoutingRule,
    deleteRoutingRule,
    toggleRoutingRule,
    savePreset,
    deletePreset,
    applyPreset,
    dismissError,
    refresh,
  } = useAudioState()

  // Keep the "playing now" list current while this tab is open.
  useEffect(() => {
    const timer = window.setInterval(refresh, 2000)
    return () => window.clearInterval(timer)
  }, [refresh])

  if (snapshot && !snapshot.routingSupported) {
    return (
      <EmptyState
        icon={<IconRoute className="size-8" />}
        title="Routing needs macOS 14.2 or newer"
        description="Update to macOS Sonoma 14.2 or later to send apps to different outputs."
      />
    )
  }

  const permissionGranted = snapshot?.capturePermission === 1
  const permissionNeeded =
    !permissionGranted &&
    ((error !== null && error.startsWith(PERMISSION_PREFIX)) ||
      snapshot?.capturePermission === 2)

  return (
    <>
      {permissionNeeded ? (
        <PermissionNotice
          detail={error}
          onOpenSettings={() => void api.openAudioPermissionSettings()}
          onRecheck={() => {
            void api.recheckCapturePermission()
            dismissError()
          }}
        />
      ) : error ? (
        <Notice onDismiss={dismissError}>{error}</Notice>
      ) : null}

      {!snapshot ? (
        <EmptyState
          icon={<IconRoute className="size-8 animate-pulse" />}
          title="Looking for apps with audio…"
        />
      ) : (
        <>
          {snapshot.routes.length > 0 ? (
            <ActiveRoutes
              routes={snapshot.routes}
              processes={snapshot.processes}
              busy={busy}
              onVolume={setRouteVolume}
              onStop={unrouteApp}
              onStopAll={stopAllRouting}
              onRemember={addRoutingRule}
            />
          ) : null}

          <RoutePicker
            snapshot={snapshot}
            busy={busy}
            onRoute={routeApp}
            onAddRule={addRoutingRule}
          />

          {snapshot.rules.length > 0 ? (
            <RulesList
              rules={snapshot.rules}
              busy={busy}
              onToggle={toggleRoutingRule}
              onDelete={deleteRoutingRule}
            />
          ) : null}

          <PresetsList
            presets={snapshot.presets}
            hasRoutes={snapshot.routes.length > 0}
            busy={busy}
            onSave={savePreset}
            onApply={applyPreset}
            onDelete={deletePreset}
          />
        </>
      )}
    </>
  )
}

export { RoutingView }
