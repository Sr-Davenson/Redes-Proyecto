document.addEventListener("DOMContentLoaded", () => {
    const ipInput = document.getElementById("ip");
    const prefijoInput = document.getElementById("prefijo");
    const cantidadInput = document.getElementById("cantidad");
    const tablaSubredes = document.getElementById("tablaSubredes");

    ipInput.addEventListener("input", () => {
        const ip = ipInput.value.trim();
        if (!validarIP(ip)) return;

        const clase = obtenerClase(ip);
        let cidr = 24;
        if (clase === "A") cidr = 8;
        else if (clase === "B") cidr = 16;
        else if (clase === "C") cidr = 24;

        prefijoInput.value = cidr;
    });

    cantidadInput.addEventListener("input", () => {
        const cantidad = parseInt(cantidadInput.value);
        tablaSubredes.innerHTML = "";

        if (isNaN(cantidad) || cantidad < 1) return;

        html += "</table>";
        tablaSubredes.innerHTML = html;
    });
});

function validarIP(ip) {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
}

function obtenerClase(ip) {
    const primerOcteto = parseInt(ip.split('.')[0]);
    if (primerOcteto < 128) return "A";
    if (primerOcteto < 192) return "B";
    if (primerOcteto < 224) return "C";
    if (primerOcteto < 240) return "D";
    return "E";
}

function ipToBin(ip) {
    return ip.split('.').map(oct => parseInt(oct).toString(2).padStart(8, '0')).join('');
}

function binToIp(bin) {
    return [0,8,16,24].map(i => parseInt(bin.slice(i, i+8), 2)).join('.');
}

function cidrToDecimal(cidr) {
    const bin = "1".repeat(cidr).padEnd(32, "0");
    return bin.match(/.{1,8}/g).map(oct => parseInt(oct, 2)).join('.');
}

function calcularFLSM() {
    const ip = document.getElementById("ip").value.trim();
    const cidrBase = parseInt(document.getElementById("prefijo").value.trim());
    const cantidad = parseInt(document.getElementById("cantidad").value.trim());
    const bitsSubred = Math.ceil(Math.log2(cantidad));
    const nuevoCIDR = cidrBase + bitsSubred;

    const hostsPorSubred = Math.pow(2, 32 - nuevoCIDR) - 2;

    const mascaraDecimal = cidrToDecimal(nuevoCIDR);

    const ipBaseBin = ipToBin(ip).slice(0, cidrBase).padEnd(32, "0");
    let cursor = BigInt("0b" + ipBaseBin);

    let resumen = `
      <h3>Resumen de la red (FLSM)</h3>
      <ul>
        <li><strong>Cantidad de subredes solicitadas:</strong> ${cantidad}</li>
        <li><strong>Bits de subred usados:</strong> ${bitsSubred}</li>
        <li><strong>Nuevo prefijo (CIDR):</strong> /${nuevoCIDR}</li>
        <li><strong>Máscara de red:</strong> ${mascaraDecimal}</li>
        <li><strong>Hosts por subred:</strong> ${hostsPorSubred}</li>
      </ul>
    `;

    let resultados = "<h3>Subredes calculadas</h3><table><tr><th>Subred</th><th>IP de red</th><th>Máscara</th><th>Primer Host</th><th>Último Host</th><th>Broadcast</th></tr>";

    for (let i = 1; i <= cantidad; i++) {
        const networkBin = cursor.toString(2).padStart(32, "0");
        const broadcastBin = cursor + BigInt(Math.pow(2, 32 - nuevoCIDR) - 1);

        const network = binToIp(networkBin);
        const broadcast = binToIp(broadcastBin.toString(2).padStart(32, "0"));
        const firstHost = binToIp((cursor + 1n).toString(2).padStart(32, "0"));
        const lastHost = binToIp((broadcastBin - 1n).toString(2).padStart(32, "0"));

        resultados += `
          <tr>
            <td>Subred ${i}</td>
            <td>${network}</td>
            <td>${mascaraDecimal}</td>
            <td>${firstHost}</td>
            <td>${lastHost}</td>
            <td>${broadcast}</td>
          </tr>
        `;

        cursor = broadcastBin + 1n;
    }

    resultados += "</table>";
    document.getElementById("flsmResultados").innerHTML = resumen + resultados;
}

