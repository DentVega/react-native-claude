# Contribuir

## Antes de abrir un PR

1. Abrí un issue primero si es un cambio grande (nuevo stack, cambio de arquitectura).
2. Para fixes chicos, abrí el PR directo.
3. Asegurate de que el workflow de CI pase localmente.

## Estructura de un cambio

- **Cambios al template**: van en `template/`.
- **Cambios a los slash commands**: van en `commands/` y actualizan el comportamiento de `/apply-template` o `/update-template`.
- **Cambios a la doc del repo**: van en `README.md`, `docs/`, o `CHANGELOG.md`.

## Releases

Las versiones siguen [Semantic Versioning](https://semver.org/):

- **MAJOR** (`v2.0.0`): breaking changes en el template (cambio en arquitectura forzada, cambio de stack base). Requiere acción manual al actualizar.
- **MINOR** (`v1.1.0`): features nuevas que son retrocompatibles (nueva skill recomendada, nuevo script, expansión de docs).
- **PATCH** (`v1.0.1`): bug fixes en archivos del template, fixes en los commands.

### Proceso de release

1. Acumular cambios en `[Unreleased]` del `CHANGELOG.md`.
2. Cuando hay material para release:
   - Mover `[Unreleased]` a `[X.Y.Z] - YYYY-MM-DD`.
   - Crear nueva sección `[Unreleased]` vacía.
   - Marcar breaking changes con ⚠️ claramente.
3. Commit: `chore(release): vX.Y.Z`
4. Tag: `git tag vX.Y.Z && git push --tags`
5. Crear GitHub Release con el contenido del CHANGELOG para esa versión.

## Tests del template

Antes de mergear cualquier PR que toque `template/`, el workflow de GitHub Actions crea un proyecto Expo limpio, aplica el template y corre `typecheck` + `lint` + `test`. Si falla, no se mergea.

## Filosofía

El template es opinionado por diseño. Antes de agregar algo:

- ¿Es genuinamente útil para >80% de las apps Expo que alguien armaría?
- ¿Mantiene la coherencia con el resto del stack?
- ¿No agrega complejidad significativa?

Si la respuesta a alguna es "no", probablemente sea mejor como customización en cada proyecto.

## Comunicación

- Issues para bugs y propuestas.
- Discussions para preguntas abiertas y RFCs.
- Slack/Discord del GDG Cochabamba para charla informal.
