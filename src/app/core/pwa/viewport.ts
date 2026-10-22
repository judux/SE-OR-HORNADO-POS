/**
 * Ajustes de pantalla para usar la app como aplicación de celular.
 *
 * - --app-h: alto útil real (entre la barra de estado y la barra de inicio del iPhone).
 *   En el iPhone instalado, 100vh/100dvh no coinciden con la pantalla y dejan una franja abajo.
 * - Sin zoom: Safari en iPhone ignora user-scalable=no, así que se bloquean los gestos de pellizco.
 */
export function setupViewport(): void {
    const root = document.querySelector('app-root') as HTMLElement | null;
    if (root) {
        const update = () => {
            const style = getComputedStyle(root);
            const height = root.clientHeight - parseFloat(style.paddingTop || '0') - parseFloat(style.paddingBottom || '0');
            if (height > 0) document.documentElement.style.setProperty('--app-h', `${height}px`);
        };
        update();
        new ResizeObserver(update).observe(root);
    }

    // Pellizco en Safari (iOS)
    for (const type of ['gesturestart', 'gesturechange', 'gestureend']) {
        document.addEventListener(type, e => e.preventDefault(), { passive: false });
    }
    // Pellizco con dos dedos en otros navegadores
    document.addEventListener('touchmove', e => {
        if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });
    // El zoom por doble toque lo quita `touch-action: manipulation` (styles.css), sin frenar
    // toques rápidos como los del teclado del PIN.
}
