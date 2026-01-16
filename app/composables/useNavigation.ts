export const useNavigation = () => {
  const navigation = [
    { label: 'Inicio', to: '/' },
    { label: 'Consultoría Social', to: '/consultoria-social' },
    { label: 'Eventos', to: '/eventos' },
    { label: 'Noticias y Blog', to: '/noticias' },
    { label: 'Material de Estudio', to: '/material-estudio' },
    { label: 'Nosotros', to: '/nosotros' },
    { label: 'Calendario', to: '/calendario' }
  ]

  return { navigation }
}
