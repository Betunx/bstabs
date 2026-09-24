## Qué cambia

<!-- 1-3 líneas. Qué hace este PR, visto desde el usuario o el admin. -->

## Por qué

<!-- Qué problema resuelve o qué item de ORCHESTRATOR.md avanza. -->

## Cómo probarlo

<!-- Pasos concretos: ruta a abrir, qué pegar en el editor, qué debería verse. -->

1.

## Checklist del autor

- [ ] `pnpm run lint && pnpm test` en verde localmente
- [ ] Lógica nueva tiene spec (o explico abajo por qué no)
- [ ] Sin claves ni secretos en el diff (`environment*.ts` reales no se commitean)
- [ ] Endpoints admin nuevos usan `verifyAdmin()`
- [ ] Docs actualizados si cambió el estado de una feature (ORCHESTRATOR / bitácora)
- [ ] El diff tiene un solo tema (si mezcla cosas, dividir en otro PR)

## Notas para quien revisa

<!-- Dónde mirar primero, decisiones dudosas, lo que quedó fuera a propósito. -->
