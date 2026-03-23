import { existsSync } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const rootDir = process.cwd();
const imageName = 'carshoprepair-linux-package';
const containerName = `carshoprepair-linux-package-${Date.now()}`;
const outputDir = join(rootDir, 'dist', 'linux-package');
const outputTar = join(outputDir, 'carshoprepair-linux-package.tar.gz');

function run(command, args, description, options = {}) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const child = spawn(command, args, {
      shell: false,
      stdio: options.captureOutput ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    });

    if (options.captureOutput) {
      child.stdout?.on('data', (chunk) => {
        stdout += String(chunk);
      });

      child.stderr?.on('data', (chunk) => {
        stderr += String(chunk);
      });
    }

    child.on('exit', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(`${description} falhou com codigo ${code ?? 'desconhecido'}.`));
    });

    child.on('error', reject);
  });
}

async function ensureRealDocker() {
  const result = await run('docker', ['--version'], 'Verificacao do Docker', { captureOutput: true });
  const output = `${result.stdout}\n${result.stderr}`.trim();

  if (!output.toLowerCase().includes('docker version')) {
    throw new Error('Comando docker invalido no PATH. Remova o pacote npm "docker" global/local e instale o Docker Desktop (Docker Engine).');
  }
}

async function main() {
  if (!existsSync(join(rootDir, 'Dockerfile.package'))) {
    throw new Error('Dockerfile.package nao encontrado.');
  }

  await mkdir(join(rootDir, 'dist'), { recursive: true });
  await rm(outputDir, { recursive: true, force: true });

  await ensureRealDocker();
  
  // Usar docker buildx para exportar ficheiros diretamente (funciona com imagens multistage)
  try {
    await run('docker', ['buildx', 'build', '-f', 'Dockerfile.package', '--output', `type=local,dest=${outputDir}`, '.'], 'Build e exportacao do pacote Linux com buildx');
  } catch (buildxError) {
    // Fallback: usar Docker normal com um contentor temporario do export stage
    console.log('Buildx nao disponivel, usando alternativa com docker builder...');
    await run('docker', ['build', '-f', 'Dockerfile.package', '-t', imageName, '--target', 'export', '.'], 'Build da imagem Linux (export stage)');
    await run('docker', ['create', '--name', containerName, imageName], 'Criacao do contentor temporario');
    
    try {
      await run('docker', ['cp', `${containerName}:/carshoprepair-linux-package.tar.gz`, outputTar], 'Exportacao do pacote Linux');
    } finally {
      await run('docker', ['rm', '-f', containerName], 'Limpeza do contentor temporario');
    }
  }

  console.log('Pacote Linux gerado com sucesso em dist/linux-package');
  console.log('Arquivo gerado: dist/linux-package/carshoprepair-linux-package.tar.gz');
  console.log('No servidor Linux: extraia o .tar.gz e execute a app a partir da pasta app/.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});