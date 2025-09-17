document.addEventListener("DOMContentLoaded", () => {
  const cont = document.getElementById("explicacion");
  const raw = localStorage.getItem("flsmDatos"); 
  if (!raw) {
    cont.innerHTML = `<div class="paso"><strong>No hay datos de FLSM.</strong><br>Primero presiona <em>CALCULAR</em> en la calculadora FLSM y luego vuelve aquí.</div>`;
    return;
  }

  const data = JSON.parse(raw);
  const {
    ip,
    cidrBase,
    cantidad,
    bitsSubred,
    nuevoCIDR,
    bitsHost,
    direccionesPorBloque,
    hostsPorSubred,
    mascaraDecimal,
    subredes
  } = data;

  let direcBig;
  try { direcBig = BigInt(direccionesPorBloque); } catch(e) { direcBig = BigInt(0); }

  const ejemplo = (subredes && subredes.length) ? subredes[0] : null;

  let html = '';

  html += `
    <div class="paso">
      <h3>🔹 Datos iniciales</h3>
      <ul>
        <li><strong>Dirección IP base:</strong> ${ip}</li>
        <li><strong>Prefijo original (CIDR):</strong> /${cidrBase}</li>
        <li><strong>Subredes solicitadas (N):</strong> ${cantidad}</li>
      </ul>
      <p class="nota">En FLSM todas las subredes tendrán el mismo tamaño (bloques iguales).</p>
    </div>
  `;

  html += `
    <div class="paso">
      <h3>1️⃣ Cálculo del número de bits de subred (n)</h3>
      <p>Debemos determinar cuántos bits necesitamos pedir prestados de la porción de host para distinguir <strong>N</strong> subredes.</p>
      <div class="formula">n = log₂(N)</div>
      <p>Aplicamos la fórmula con N = ${cantidad}:</p>
      <div class="formula">n = log₂(${cantidad}) = <strong>${bitsSubred}</strong></div>
      <p class="nota">Interpretación: con ${bitsSubred} bits podemos representar hasta <strong>${Math.pow(2,bitsSubred)}</strong> subredes (2^n).</p>
    </div>
  `;

  html += `
    <div class="paso">
      <h3>2️⃣ Nuevo prefijo (CIDR)</h3>
      <p>El nuevo prefijo suma los bits prestados al prefijo original:</p>
      <div class="formula">nuevoPrefijo = prefijoBase + n</div>
      <p>Sustituyendo: /${cidrBase} + ${bitsSubred} = <strong>/${nuevoCIDR}</strong></p>
    </div>
  `;

  html += `
    <div class="paso">
      <h3>3️⃣ Máscara de subred (decimal)</h3>
      <p>El prefijo <strong>/${nuevoCIDR}</strong> equivale a la máscara:</p>
      <div class="formula">${mascaraDecimal}  (/${nuevoCIDR})</div>
      <p class="nota">Esta máscara fija cuántos bits se usan para identificar la red/subred.</p>
    </div>
  `;

  html += `
    <div class="paso">
      <h3>4️⃣ Bits para hosts y hosts por subred</h3>
      <p>Bits de host = 32 - nuevoPrefijo</p>
      <div class="formula">bits_host = 32 - ${nuevoCIDR} = <strong>${bitsHost}</strong></div>

      <p>Direcciones totales por subred (incluye red y broadcast):</p>
      <div class="formula">2^bits_host = 2^${bitsHost} = <strong>${direcBig.toString()}</strong></div>

      <p>Hosts útiles por subred (no contamos la dirección de red ni el broadcast):</p>
      <div class="formula">Hosts útiles = 2^bits_host - 2 = <strong>${hostsPorSubred}</strong></div>
    </div>
  `;

  html += `
    <div class="paso">
      <h3>5️⃣ Salto de red y generación de subredes</h3>
      <p>El salto indica cada cuántas direcciones empieza una nueva subred.</p>
      <div class="formula">salto = 2^bits_host = ${direcBig.toString()}</div>
      <p>Así, si la Subred 1 empieza en la IP X, la Subred 2 empezará X + ${direcBig.toString()}, la Subred 3 en X + 2·${direcBig.toString()}, etc.</p>
    </div>
  `;

  if (ejemplo) {
    const netBin = ejemplo.networkBin || '';
    const bcastBin = ejemplo.broadcastBin || '';
    html += `
      <div class="paso">
        <h3>6️⃣ Ejemplo detallado — Subred 1</h3>
        <p><strong>Dirección de red (binario, agrupado por octeto):</strong></p>
        <pre class="bin">${formatBinGroups(netBin)}</pre>

        <p><strong>Dirección de red (decimal):</strong> ${ejemplo.network}</p>

        <p><strong>Broadcast (binario, agrupado por octeto):</strong></p>
        <pre class="bin">${formatBinGroups(bcastBin)}</pre>

        <p><strong>Broadcast (decimal):</strong> ${ejemplo.broadcast}</p>

        <p><strong>Rango de hosts útiles:</strong> ${ejemplo.firstHost} — ${ejemplo.lastHost}</p>

        <p class="nota">Comprobación rápida: el número de direcciones entre dirección de red y broadcast (inclusive) es ${direcBig.toString()}, de las cuales ${hostsPorSubred} son utilizables para dispositivos.</p>
      </div>
    `;
  } else {
    html += `<div class="paso"><p>No hay subredes calculadas para mostrar un ejemplo. Primero presiona <strong>CALCULAR</strong> en la calculadora FLSM.</p></div>`;
  }

  html += `
    <div class="paso">
      <h3>✅ Conclusión</h3>
      <p>Al dividir <strong>${ip}/${cidrBase}</strong> en <strong>${cantidad}</strong> subredes iguales (FLSM), pedimos <strong>${bitsSubred}</strong> bits,
      por lo que el nuevo prefijo es <strong>/${nuevoCIDR}</strong>. Cada subred tiene <strong>${direcBig.toString()}</strong> direcciones y <strong>${hostsPorSubred}</strong> hosts útiles.</p>
    </div>
  `;

  cont.innerHTML = html;

  function formatBinGroups(bin32) {
    if (!bin32) return '';
    const b = bin32.padStart(32, '0');
    return b.match(/.{1,8}/g).join(' ');
  }
});
