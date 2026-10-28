-- Rol para quien se registra por su cuenta desde /registro.
--
-- Va solo en su propia migracion: Postgres no deja usar un valor nuevo de un
-- enum dentro de la misma transaccion que lo agrega, y la siguiente migracion
-- (20261028130000_self_signup.sql) lo usa en funciones y policies.
--
-- 'usuario' es alguien del publico, no del club: registra su progreso en los
-- casos de estudio y se inscribe en eventos abiertos, pero no edita contenido ni
-- entra a actividades "solo miembros". Un admin lo puede subir de rol desde
-- /admin/usuarios.

alter type public.user_role add value if not exists 'usuario';
