document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const ip = params.get("ip");
    const cidr = parseInt(params.get("cidr"));

    if (!validarIP(ip) || isNaN(cidr) || cidr < 1 || cidr > 32) {
        document.getElementById("explicacion").innerHTML = "<p>⚠️ Parámetros inválidos.</p>";
        return;
    }

    const ipBin = ipToBin(ip);
    const ipBinOctetos = ipBin.match(/.{1,8}/g).join('.');
    const ipDecimal = ip;
    const clase = obtenerClase(ip);
    const maskBin = "1".repeat(cidr).padEnd(32, "0");
    const maskBinOctetos = maskBin.match(/.{1,8}/g).join('.');
    const maskDecimal = cidrToDecimal(cidr);
    const wildcardBin = maskBin.split('').map(b => b === '1' ? '0' : '1').join('');
    const wildcardDecimal = cidrToWildcard(cidr);
    const networkBin = ipBin.slice(0, cidr).padEnd(32, "0");
    const networkDecimal = binToIp(networkBin);
    const hostBin = ipBin.slice(cidr).padStart(32, "0");
    const hostDecimal = binToIp(hostBin);
    const firstHost = binToIp(incrementBin(networkBin));
    const lastHost = binToIp(decrementBin(ipBin.slice(0, cidr).padEnd(32, "1")));
    const broadcast = binToIp(ipBin.slice(0, cidr).padEnd(32, "1"));
    const totalHosts = Math.pow(2, 32 - cidr) - 2;

    document.getElementById("explicacion").innerHTML = `
    <h2>1. Dirección IPv4</h2>
    <p>Binario: ${ipBin}</p>
    <p>Octetos: ${ipBinOctetos}</p>
    <p>Decimal punteado: ${ipDecimal}</p>
    <p>Clase: ${clase}</p>

    <h2>2. Máscara de red</h2>
    <p>Binario: ${maskBinOctetos}</p>
    <p>Decimal: ${maskDecimal}</p>

    <h2>3. Máscara Wildcard</h2>
    <p>Binario: ${wildcardBin.match(/.{1,8}/g).join('.')}</p>
    <p>Decimal: ${wildcardDecimal}</p>

    <h2>4. Dirección de red</h2>
    <p>Binario: ${networkBin.match(/.{1,8}/g).join('.')}</p>
    <p>Decimal: ${networkDecimal}</p>

    <h2>5. Dirección de host</h2>
    <p>Binario: ${hostBin.match(/.{1,8}/g).join('.')}</p>
    <p>Decimal: ${hostDecimal}</p>

    <h2>6. Primer host</h2>
    <p>${firstHost}</p>

    <h2>7. Último host</h2>
    <p>${lastHost}</p>

    <h2>8. Dirección de difusión</h2>
    <p>${broadcast}</p>

    <h2>9. Número de direcciones asignables</h2>
    <p>2<sup>${32 - cidr}</sup> - 2 = ${totalHosts}</p>
  `;
});

// Funciones reutilizadas
function validarIP(ip) {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
}
function ipToBin(ip) {
    return ip.split('.').map(oct => parseInt(oct).toString(2).padStart(8, '0')).join('');
}
function binToIp(bin) {
    return [0, 8, 16, 24].map(i => parseInt(bin.slice(i, i + 8), 2)).join('.');
}
function incrementBin(bin) {
    return (BigInt('0b' + bin) + 1n).toString(2).padStart(32, '0');
}
function decrementBin(bin) {
    return (BigInt('0b' + bin) - 1n).toString(2).padStart(32, '0');
}
function obtenerClase(ip) {
    const primerOcteto = parseInt(ip.split('.')[0]);
    if (primerOcteto < 128) return "A";
    if (primerOcteto < 192) return "B";
    if (primerOcteto < 224) return "C";
    if (primerOcteto < 240) return "D";
    return "E";
}
function cidrToDecimal(cidr) {
    const bin = "1".repeat(cidr).padEnd(32, "0");
    return [0, 8, 16, 24].map(i => parseInt(bin.slice(i, i + 8), 2)).join('.');
}
function cidrToWildcard(cidr) {
    const bin = "1".repeat(cidr).padEnd(32, "0");
    const wildcardBin = bin.split('').map(b => b === '1' ? '0' : '1').join('');
    return [0, 8, 16, 24].map(i => parseInt(wildcardBin.slice(i, i + 8), 2)).join('.');
}

function visualizarBinarioColoreado(binStr, cidr) {
  let html = '<div class="binario">';
  for (let i = 0; i < 32; i++) {
    const clase = i < cidr ? "red" : "host";
    html += `<span class="bit ${clase}">${binStr[i]}</span>`;
    if ((i + 1) % 8 === 0) html += " ";
  }
  html += '</div>';
  return html;
}

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const ip = params.get("ip");
    const cidr = parseInt(params.get("cidr"));

    if (!validarIP(ip) || isNaN(cidr) || cidr < 1 || cidr > 32) {
        document.getElementById("explicacion").innerHTML = "<p>⚠️ Parámetros inválidos.</p>";
        return;
    }

    const ipBin = ipToBin(ip);
    const ipBinOctetos = ipBin.match(/.{1,8}/g).join('.');
    const clase = obtenerClase(ip);
    const maskBin = "1".repeat(cidr).padEnd(32, "0");
    const maskBinOctetos = maskBin.match(/.{1,8}/g).join('.');
    const maskDecimal = cidrToDecimal(cidr);
    const wildcardBin = maskBin.split('').map(b => b === '1' ? '0' : '1').join('');
    const wildcardDecimal = cidrToWildcard(cidr);
    const networkBin = ipBin.slice(0, cidr).padEnd(32, "0");
    const networkBinOctetos = networkBin.match(/.{1,8}/g).join('.');
    const networkDecimal = binToIp(networkBin);
    const hostBin = ipBin.slice(cidr).padStart(32, "0");
    const hostBinOctetos = hostBin.match(/.{1,8}/g).join('.');
    const hostDecimal = binToIp(hostBin);
    const firstHost = binToIp(incrementBin(networkBin));
    const lastHost = binToIp(decrementBin(ipBin.slice(0, cidr).padEnd(32, "1")));
    const broadcast = binToIp(ipBin.slice(0, cidr).padEnd(32, "1"));
    const broadcastBinOctetos = ipBin.slice(0, cidr).padEnd(32, "1").match(/.{1,8}/g).join('.');
    const totalHosts = Math.pow(2, 32 - cidr) - 2;

    const html = `
    <h2>1. Dirección IPv4</h2>
    <p>Una Dirección IP es un número de 32 bits que identifica de manera única a un host en una red determinada.</p>
    <p><code>${ipBin}</code></p>
    <p>Para que sea más legible, se divide en octetos:</p>
    <p><code>${ipBinOctetos}</code></p>
    <p>Y en notación decimal punteada:</p>
    <p><strong>${ip}</strong></p>
    <p>Esta IP pertenece a la <strong>Clase ${clase}</strong> y se acompaña del prefijo <strong>/${cidr}</strong>, lo que indica que ${cidr} bits son de red y ${32 - cidr} de host.</p>

    <h2>2. Máscara de red</h2>
    <p>La máscara de red se construye con unos en la porción de red y ceros en la porción de host:</p>
    <p><code>${maskBinOctetos}</code></p>
    <p>En decimal punteado:</p>
    <p><strong>${maskDecimal}</strong></p>

    <h2>3. Máscara Wildcard</h2>
    <p>La máscara wildcard es la inversa de la máscara de red:</p>
    <p><code>${wildcardBin.match(/.{1,8}/g).join('.')}</code></p>
    <p><strong>${wildcardDecimal}</strong></p>

    <h2>4. Dirección de red</h2>
    <p>Se obtiene poniendo ceros en la porción de host:</p>
    <p><code>${networkBinOctetos}</code></p>
    <p><strong>${networkDecimal}</strong></p>

    <h2>5. Dirección de host</h2>
    <p>La dirección IP ingresada <strong>${ip}</strong> representa un host específico dentro de la red.</p>
    <p>Su representación binaria completa es:</p>
    <p><code>${ipBinOctetos}</code></p>
    <p>Según el prefijo <strong>/${cidr}</strong>, los primeros ${cidr} bits corresponden a la porción de red, y los últimos ${32 - cidr} bits a la porción de host.</p>
    <p>Esto significa que la dirección <strong>${ip}</strong> está compuesta por:</p>
    <ul>
    <li><strong>Porción de red:</strong> <code>${ipBin.slice(0, cidr)}</code></li>
    <li><strong>Porción de host:</strong> <code>${ipBin.slice(cidr)}</code></li>
    </ul>
    <p>Esta división permite identificar de forma única al host dentro de su red.</p>

    <h2>6. Dirección del primer host</h2>
    <p>La dirección del primer host es la primera dirección IP asignable dentro de la red. Se obtiene dejando todos los bits de la porción de host en cero, excepto el último bit en uno.</p>
    <p>Representación binaria:</p>
    <p><code>${incrementBin(networkBin).match(/.{1,8}/g).join('.')}</code></p>
    <p>Notación decimal punteada:</p>
    <p><strong>${firstHost}</strong></p>
    
    <h2>7. Dirección del último host</h2>
    <p>La dirección del último host es la última dirección IP asignable dentro de la red. Se obtiene dejando todos los bits de la porción de host en uno, excepto el último bit en cero.</p>
    <p>Representación binaria:</p>
    <p><code>${decrementBin(ipBin.slice(0, cidr).padEnd(32, "1")).match(/.{1,8}/g).join('.')}</code></p>
    <p>Notación decimal punteada:</p>
    <p><strong>${lastHost}</strong></p>

    <h2>8. Dirección de difusión</h2>
    <p>Se obtiene poniendo todos los bits de host en uno:</p>
    <p><code>${broadcastBinOctetos}</code></p>
    <p><strong>${broadcast}</strong></p>

    <h2>9. Número de direcciones asignables</h2>
    <p>Se calcula como 2<sup>${32 - cidr}</sup> - 2 = <strong>${totalHosts}</strong></p>
  `;

    document.getElementById("explicacion").innerHTML = html;
});