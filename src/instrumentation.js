export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        await import('@/lib/shutdown');
        console.log('Shutdown handlers registered');
    }
}