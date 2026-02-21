import { createFileRoute, redirect } from '@tanstack/react-router'
import { IconChevronDown, IconFingerprint, IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { queryClient, getMeQueryOptions, passkeysQueries } from '@/lib/query'
import { useLogout } from '@/hooks/use-logout'
import { usePasskeys } from '@/hooks/use-passkeys'
import type { Passkey } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

export const Route = createFileRoute('/profile')({
  beforeLoad: async () => {
    const user = await queryClient.ensureQueryData(getMeQueryOptions)
    if (!user) {
      throw redirect({ to: '/login' })
    }
    return { user }
  },
  loader: async ({ context: { user } }) => {
    await queryClient.prefetchQuery(passkeysQueries.list(user.id))
  },
  component: ProfilePage,
})

function formatDate(dateStr: string | null) {
  if (!dateStr) {
    return '—'
  }
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

type PasskeyItemProps = {
  passkey: Passkey
  isOnly: boolean
  renameId: string | null
  renameValue: string
  deleteConfirmId: string | null
  onRenameStart: (id: string, currentName: string) => void
  onRenameChange: (value: string) => void
  onRenameCancel: () => void
  onRenameSave: (id: string) => void
  onDeleteStart: (id: string) => void
  onDeleteCancel: () => void
  onDeleteConfirm: (id: string) => void
  isRenamePending: boolean
  isDeletePending: boolean
}

function PasskeyItem({
  passkey,
  isOnly,
  renameId,
  renameValue,
  deleteConfirmId,
  onRenameStart,
  onRenameChange,
  onRenameCancel,
  onRenameSave,
  onDeleteStart,
  onDeleteCancel,
  onDeleteConfirm,
  isRenamePending,
  isDeletePending,
}: PasskeyItemProps) {
  const [open, setOpen] = useState(false)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      if (renameId === passkey.id) {
        onRenameCancel()
      }
      if (deleteConfirmId === passkey.id) {
        onDeleteCancel()
      }
    }
  }

  const isRenaming = renameId === passkey.id
  const isConfirmingDelete = deleteConfirmId === passkey.id

  return (
    <Collapsible open={open} onOpenChange={handleOpenChange}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2.5 text-left group">
        <span className="text-sm font-medium">{passkey.name}</span>
        <IconChevronDown
          size={14}
          className="text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
        />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="pb-3 space-y-3">
          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                Last used
              </p>
              <p className="text-xs text-foreground/80">
                {formatDate(passkey.last_used_at)}
              </p>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                Created
              </p>
              <p className="text-xs text-foreground/80">
                {formatDate(passkey.created_at)}
              </p>
            </div>
          </div>

          {/* Actions */}
          {isRenaming ? (
            <div className="flex items-center gap-2">
              <Input
                value={renameValue}
                onChange={(e) => onRenameChange(e.target.value)}
                className="h-7 text-xs"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onRenameSave(passkey.id)
                  }
                  if (e.key === 'Escape') {
                    onRenameCancel()
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => onRenameSave(passkey.id)}
                disabled={isRenamePending || !renameValue.trim()}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onRenameCancel}
                disabled={isRenamePending}
              >
                Cancel
              </Button>
            </div>
          ) : isConfirmingDelete ? (
            <div className="space-y-2">
              {isOnly && (
                <p className="text-xs text-destructive">
                  This is your only passkey — you won't be able to sign in
                  without it.
                </p>
              )}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDeleteConfirm(passkey.id)}
                  disabled={isDeletePending}
                >
                  Confirm delete
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDeleteCancel}
                  disabled={isDeletePending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center -ml-2">
              <Button
                variant="link"
                onClick={() => onRenameStart(passkey.id, passkey.name)}
              >
                Rename
              </Button>
              <Button
                variant="link-destructive"
                onClick={() => onDeleteStart(passkey.id)}
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function ProfilePage() {
  const { user } = Route.useRouteContext()
  const handleLogout = useLogout()
  const { passkeys, isPending, renameMutation, deleteMutation, addMutation } =
    usePasskeys(user.id)

  const [renameId, setRenameId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  function handleRenameStart(id: string, currentName: string) {
    setRenameId(id)
    setRenameValue(currentName)
    setDeleteConfirmId(null)
  }

  function handleRenameCancel() {
    setRenameId(null)
    setRenameValue('')
  }

  function handleRenameSave(credentialId: string) {
    if (!renameValue.trim()) {
      return
    }
    renameMutation.mutate(
      { credentialId, name: renameValue.trim() },
      {
        onSuccess: () => {
          setRenameId(null)
          setRenameValue('')
        },
      },
    )
  }

  function handleDeleteStart(id: string) {
    setDeleteConfirmId(id)
    setRenameId(null)
    setRenameValue('')
  }

  function handleDeleteCancel() {
    setDeleteConfirmId(null)
  }

  function handleDeleteConfirm(credentialId: string) {
    deleteMutation.mutate(credentialId, {
      onSuccess: () => setDeleteConfirmId(null),
    })
  }

  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center overflow-hidden auth-bg">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[500px] rounded-full blur-[120px]"
        style={{ background: 'oklch(0.78 0.24 152 / 0.07)' }}
      />

      <div className="relative w-full max-w-sm px-5 py-10 animate-fade-up">
        {/* Identity card */}
        <div className="relative border border-border bg-card gradient-top-border">
          {/* Card header */}
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <div className="flex size-8 items-center justify-center border border-primary/35 bg-primary/10">
              <IconFingerprint size={16} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Identity
              </p>
              <p className="font-display text-sm font-bold leading-tight">
                Verified
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary">
              <span
                className="size-1.5 rounded-full bg-primary"
                style={{ animation: 'glow-pulse 2s ease-in-out infinite' }}
              />
              Active
            </div>
          </div>

          {/* Card body */}
          <div className="px-5 py-5 space-y-5">
            <div>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Username
              </p>
              <p className="font-display text-3xl font-bold tracking-tight">
                {user.username}
              </p>
            </div>

            <div>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Member since
              </p>
              <p className="text-sm">{memberSince}</p>
            </div>

            {/* Passkeys section */}
            <div className="border-t border-border pt-5">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Passkeys
              </p>

              {isPending ? (
                <div className="h-10 animate-pulse rounded bg-muted/50" />
              ) : (
                <div className="divide-y divide-border">
                  {passkeys.map((pk) => (
                    <PasskeyItem
                      key={pk.id}
                      passkey={pk}
                      isOnly={passkeys.length === 1}
                      renameId={renameId}
                      renameValue={renameValue}
                      deleteConfirmId={deleteConfirmId}
                      onRenameStart={handleRenameStart}
                      onRenameChange={setRenameValue}
                      onRenameCancel={handleRenameCancel}
                      onRenameSave={handleRenameSave}
                      onDeleteStart={handleDeleteStart}
                      onDeleteCancel={handleDeleteCancel}
                      onDeleteConfirm={handleDeleteConfirm}
                      isRenamePending={renameMutation.isPending}
                      isDeletePending={deleteMutation.isPending}
                    />
                  ))}
                </div>
              )}

              <Button
                size="sm"
                variant="ghost"
                onClick={() => addMutation.mutate()}
                disabled={addMutation.isPending}
                className="-mx-2 mt-1 text-primary hover:text-primary"
              >
                <IconPlus />
                {addMutation.isPending
                  ? 'Waiting for passkey…'
                  : 'Add a passkey'}
              </Button>
            </div>

            <div className="pt-1">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full"
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>

        {/* Secured by passkey badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          <IconFingerprint size={11} className="text-primary/60" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
            Secured by passkey
          </span>
        </div>
      </div>
    </div>
  )
}
