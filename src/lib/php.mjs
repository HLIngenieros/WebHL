// PHP en `astro dev`: levanta el PHP portátil sobre public/ y le pasa /api/*.php (agente y formularios), para probar
// el agente con recarga en caliente. Los JSON que el PHP lee (conocimiento, documentos) salen del último `npm run build`
// (HL_DATOS=dist/api). En `astro build` no hace nada. Sin php.exe, avisa y el sitio sigue sin agente.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const PUERTO = 8081;

export default function php() {
  return {
    name: 'hl-php',
    hooks: {
      'astro:config:setup': ({ command, updateConfig, logger }) => {
        if (command !== 'dev') return;
        const exe = process.env.HL_PHP || join(process.env.USERPROFILE ?? '', 'herramientas/php/php.exe');
        if (!existsSync(exe)) return logger.warn(`No encuentro php.exe en ${exe} (define HL_PHP): /api/*.php no responde en desarrollo.`);
        const datos = resolve('dist/api');
        if (!existsSync(join(datos, 'conocimiento.json'))) logger.warn('Falta dist/api/conocimiento.json: corre `npm run build` una vez para que el agente tenga contenido.');
        const ini = join(dirname(exe), 'php.ini'); // con cacert.pem (lo deja listo design/local.ps1)
        const args = [...(existsSync(ini) ? ['-c', ini] : []), '-S', `127.0.0.1:${PUERTO}`, '-t', 'public'];
        const proceso = spawn(exe, args, { env: { ...process.env, HL_DATOS: datos, HL_FORM_PRUEBA: '1' }, stdio: 'ignore' });
        const cerrar = () => proceso.kill();
        process.once('exit', cerrar);
        process.once('SIGINT', () => { cerrar(); process.exit(); });
        // changeOrigin: false conserva el Host: agente.php lo compara con el origen de la petición.
        updateConfig({ vite: { server: { proxy: { '^/api/.*\\.php': { target: `http://127.0.0.1:${PUERTO}`, changeOrigin: false } } } } });
        logger.info(`PHP en 127.0.0.1:${PUERTO} para /api/*.php (formularios en modo prueba: los correos van al temporal).`);
      },
    },
  };
}
