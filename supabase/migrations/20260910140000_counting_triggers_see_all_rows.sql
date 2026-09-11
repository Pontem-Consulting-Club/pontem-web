-- Los triggers que cuentan filas de toda la tabla corrian con los permisos de
-- quien escribia, y RLS les escondia las filas ajenas:
--
--  - Cupo (FR-20): un miembro solo ve sus propias inscripciones, asi que el
--    trigger contaba 0 y lo dejaba entrar a un evento lleno. El `for update`
--    sobre el evento tampoco serializaba nada, porque un miembro no puede
--    actualizar eventos y la fila quedaba fuera del bloqueo.
--  - Ultimo admin (ADM-5): quien se desactivaba a si mismo dejaba de ser admin
--    dentro del mismo trigger, pasaba a ver solo su propia fila y el sistema
--    creia que no quedaba ningun admin aunque hubiera otros.
--
-- Como security definer corren como el dueno de la tabla, que no esta sujeto a
-- RLS, y cuentan todas las filas.

alter function public.event_registrations_enforce_capacity()
    security definer
    set search_path = public;

alter function public.profiles_require_an_admin()
    security definer
    set search_path = public;
