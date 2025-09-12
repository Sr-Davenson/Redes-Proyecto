function calcularFLSM() {
    const ip = document.getElementById("ip").value.trim();
    const cidrBase = parseInt(document.getElementById("prefijo").value.trim());
    const cantidad = parseInt(document.getElementById("cantidad").value.trim());

    if (!validarIP(ip) || isNaN(cidrBase) || cidrBase < 1 || cidrBase > 32 || isNaN(cantidad) || cantidad < 1) {
        alert("⚠️ Verifica que la IP, prefijo y cantidad de subredes sean válidos.");
        return;
    }

    const bitsSubred = Math.ceil(Math.log2(cantidad));
    const nuevoCIDR = cidrBase + bitsSubred;

    if (nuevoCIDR > 32) {
        alert("⚠️ No es posible crear tantas subredes con este prefijo base.");
        return;
    }

    const mascaraDecimal = cidrToDecimal(nuevoCIDR);
    const hostsPorSubred = Math.pow(2, 32 - nuevoCIDR) - 2;

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
        const networkBin = cursor.toString(2).padStart(32, '0');
        const broadcastBin = cursor + BigInt(Math.pow(2, 32 - nuevoCIDR) - 1);

        const network = binToIp(networkBin);
        const broadcast = binToIp(broadcastBin.toString(2).padStart(32, '0'));
        const firstHost = binToIp((cursor + 1n).toString(2).padStart(32, '0'));
        const lastHost = binToIp((broadcastBin - 1n).toString(2).padStart(32, '0'));

        resultados += `<tr>
      <td>Subred ${i}</td>
      <td>${network}</td>
      <td>${mascaraDecimal}</td>
      <td>${firstHost}</td>
      <td>${lastHost}</td>
      <td>${broadcast}</td>
    </tr>`;

        cursor = broadcastBin + 1n;
    }

    resultados += "</table>";
    document.getElementById("vlsmResultados").innerHTML = resumen + resultados;
}
