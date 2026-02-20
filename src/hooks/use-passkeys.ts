import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addPasskeyFinish, addPasskeyStart, deletePasskey, renamePasskey } from '@/lib/auth'
import { passkeysQueries } from '@/lib/query'

export function usePasskeys(userId: string) {
  const qc = useQueryClient()
  const opts = passkeysQueries.list(userId)
  const invalidate = () => qc.invalidateQueries({ queryKey: opts.queryKey })

  const query = useQuery(opts)

  const renameMutation = useMutation({
    mutationFn: ({
      credentialId,
      name,
    }: {
      credentialId: string
      name: string
    }) => renamePasskey({ data: { credentialId, name } }),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: (credentialId: string) =>
      deletePasskey({ data: { credentialId } }),
    onSuccess: invalidate,
  })

  const addMutation = useMutation({
    mutationFn: async () => {
      const options = await addPasskeyStart()
      if (!options.publicKey) {
        throw new Error('No creation options returned')
      }
      const publicKey = PublicKeyCredential.parseCreationOptionsFromJSON(
        options.publicKey,
      )
      const credential = (await navigator.credentials.create({
        publicKey,
      })) as PublicKeyCredential
      await addPasskeyFinish({ data: { credential: credential.toJSON() } })
    },
    onSuccess: invalidate,
  })

  return {
    passkeys: query.data ?? [],
    isPending: query.isPending,
    renameMutation,
    deleteMutation,
    addMutation,
  }
}
