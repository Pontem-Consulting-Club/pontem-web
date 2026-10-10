import ConfirmDialog from '~/components/ConfirmDialog.vue'

/**
 * Confirmaciones en un UModal, en vez de window.confirm (que no se puede diseñar,
 * deja sus botones en el idioma del navegador y algunos navegadores integrados
 * bloquean). Cerrar el diálogo con Escape o fuera de él cuenta como "no".
 */
export function useConfirm() {
  const dialog = useOverlay().create(ConfirmDialog)

  const confirm = async (props: InstanceType<typeof ConfirmDialog>['$props']) =>
    (await dialog.open(props).result) === true

  return {
    confirm,
    /** "¿Eliminar este proyecto?" — `what` va con su artículo: "este proyecto". */
    confirmDelete: (what: string) => confirm({
      title: `¿Eliminar ${what}?`,
      description: 'Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      destructive: true
    }),
    confirmDiscard: () => confirm({
      title: '¿Descartar los cambios?',
      description: 'Lo que cambiaste en este formulario no se guardó.',
      confirmLabel: 'Descartar',
      cancelLabel: 'Seguir editando',
      destructive: true
    })
  }
}
