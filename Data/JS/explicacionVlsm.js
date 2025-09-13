document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("vlsmData") || "{}");
  if (!data.ip || !data.cidrBase || !data.necesidades) {
    document.getElementById("explicacion").innerHTML = "<p>No hay datos disponibles.</p>";
    return;
  }

  const { ip, cidrBase, necesidades } = data;

  // Tomamos la primera subred como ejemplo
  const ejemplo = necesidades[0];
  const hosts = ejemplo.hosts;

  // Paso 1: Calcular bits de host
  const bitsHost = Math.ceil(Math.log2(hosts + 2));

  // Paso 2: Calcular bits de subred
  const bitsSubred = 32 - bitsHost;

  // Paso 3: Nueva máscara
  const binMascara = "1".repeat(bitsSubred).padEnd(32, "0");
  const mascaraDecimal = binMascara.match(/.{1,8}/g).map(b => parseInt(b, 2)).join(".");

  // Paso 4: Calcular salto
  const salto = Math.pow(2, bitsHost);

  // Explicación paso a paso mejorada
  let html = `
    <h3>🔹 Datos iniciales</h3>
    <ul>
      <li><strong>Dirección IP base:</strong> ${ip}</li>
      <li><strong>Prefijo original:</strong> /${cidrBase}</li>
      <li><strong>Hosts requeridos en esta subred:</strong> ${hosts}</li>
    </ul>

    <h3>1️⃣ Calcular el número de bits de host necesarios</h3>
    <p>Para que una subred funcione necesitamos reservar bits para los <strong>hosts</strong>.  
    Los hosts son las direcciones que se asignan a computadoras, impresoras, routers, etc.</p>

    <p>Fórmula:</p>
    <div class="formula">2^h - 2 ≥ Hosts requeridos</div>
    <p>
      El <code>-2</code> es porque siempre se pierde 1 dirección para la <strong>red</strong> y 1 para el <strong>broadcast</strong>.
    </p>
    <p>
      Reemplazamos: 2^h - 2 ≥ ${hosts} → h = ${bitsHost} bits
    </p>

    <h3>2️⃣ Calcular el número de bits de subred</h3>
    <p>En IPv4 una dirección tiene 32 bits en total.  
    Si ${bitsHost} se usan para los hosts, el resto son para identificar la red y la subred:</p>

    <div class="formula">Bits de subred = 32 - h = 32 - ${bitsHost} = ${bitsSubred}</div>

    <h3>3️⃣ Calcular la nueva máscara de subred</h3>
    <p>La máscara se construye poniendo <code>1</code> en los bits de red y <code>0</code> en los de host:</p>
    <div class="formula">${mascaraDecimal}  (/ ${bitsSubred})</div>
    <p>
      Esto significa que los primeros ${bitsSubred} bits identifican la red y los últimos ${bitsHost} bits son para los hosts.
    </p>

    <h3>4️⃣ Calcular el salto de red</h3>
    <p>El salto de red indica cada cuántas direcciones empieza una nueva subred.  
    Se calcula con:</p>
    <div class="formula">Salto = 2^h = 2^${bitsHost} = ${salto}</div>
    <p>
      Esto quiere decir que la siguiente subred comenzará ${salto} direcciones más adelante que la actual.
    </p>

    <h3>5️⃣ Calcular los parámetros de la subred</h3>
    <p>Con la IP base y la máscara obtenemos:</p>
    <ul>
      <li><strong>Dirección de red:</strong> se ponen en <code>0</code> los bits de host.</li>
      <li><strong>Dirección de broadcast:</strong> se ponen en <code>1</code> los bits de host.</li>
      <li><strong>Primer host válido:</strong> Dirección de red + 1.</li>
      <li><strong>Último host válido:</strong> Broadcast - 1.</li>
    </ul>

    <h3>6️⃣ Calcular el resto de subredes</h3>
    <p>Una vez sabemos el salto (${salto}), las demás subredes se construyen sumando múltiplos del salto a la dirección de red inicial.</p>
    <p>
      Ejemplo: si la primera subred empieza en 192.168.0.0 y el salto es ${salto},  
      la segunda subred comienza en 192.168.0.${salto},  
      la tercera en 192.168.0.${salto * 2}, y así sucesivamente.
    </p>
  `;

  document.getElementById("explicacion").innerHTML = html;
});
