document.addEventListener("DOMContentLoaded", () => {
  const ipInput = document.getElementById("ip");
  const prefijoInput = document.getElementById("prefijo");

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
});

function validarIP(ip) {
  if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) return false;
  return ip.split('.').every(o => {
    const n = parseInt(o, 10);
    return n >= 0 && n <= 255;
  });
}

function obtenerClase(ip) {
  const primerOcteto = parseInt(ip.split('.')[0], 10);
  if (primerOcteto < 128) return "A";
  if (primerOcteto < 192) return "B";
  if (primerOcteto < 224) return "C";
  if (primerOcteto < 240) return "D";
  return "E";
}

function ipToBin(ip) {
  return ip.split('.')
           .map(oct => parseInt(oct, 10).toString(2).padStart(8, '0'))
           .join('');
}

function binToIp(bin) {
  return [0, 8, 16, 24]
    .map(i => parseInt(bin.slice(i, i + 8), 2))
    .join('.');
}

function cidrToDecimal(cidr) {
  const bin = "1".repeat(cidr).padEnd(32, "0");
  return bin.match(/.{1,8}/g)
            .map(oct => parseInt(oct, 2))
            .join('.');
}

function calcularFLSM() {
  const ip = document.getElementById("ip").value.trim();
  const cidrBase = parseInt(document.getElementById("prefijo").value.trim(), 10);
  const cantidad = parseInt(document.getElementById("cantidad").value.trim(), 10);

  if (!validarIP(ip) || isNaN(cidrBase) || cidrBase < 1 || cidrBase > 32 || isNaN(cantidad) || cantidad < 1) {
    alert("⚠️ Verifica que la IP, prefijo y cantidad de subredes sean válidos.");
    return;
  }

  const bitsSubred = Math.ceil(Math.log2(cantidad));
  const nuevoCIDR = cidrBase + bitsSubred;
  const bitsHost = 32 - nuevoCIDR;
  const direccionesPorBloqueBig = 1n << BigInt(bitsHost);
  const direccionesPorBloque = Number(direccionesPorBloqueBig);
  const hostsPorSubred = direccionesPorBloque - 2;
  const mascaraDecimal = cidrToDecimal(nuevoCIDR);

  const ipBaseBin = ipToBin(ip).slice(0, cidrBase).padEnd(32, "0");
  let cursor = BigInt("0b" + ipBaseBin);

  let resumenHtml = `
    <h3>Resumen de la red (FLSM)</h3>
    <ul>
      <li><strong>Cantidad de subredes solicitadas:</strong> ${cantidad}</li>
      <li><strong>Bits de subred usados:</strong> ${bitsSubred}</li>
      <li><strong>Nuevo prefijo (CIDR):</strong> /${nuevoCIDR}</li>
      <li><strong>Máscara de red:</strong> ${mascaraDecimal}</li>
      <li><strong>Hosts por subred (útiles):</strong> ${hostsPorSubred}</li>
    </ul>
  `;

  let resultadosHtml = `
    <h3>Subredes calculadas</h3>
    <table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse; width:100%; text-align:center;">
      <tr style="background:#0b5ed7; color:white;">
        <th>Subred</th>
        <th>IP de red</th>
        <th>Máscara</th>
        <th>Primer Host</th>
        <th>Último Host</th>
        <th>Broadcast</th>
        <th>#Direcciones</th>
      </tr>
  `;

  const subredes = [];

  for (let i = 1; i <= cantidad; i++) {
    const networkBin = cursor.toString(2).padStart(32, "0");
    const broadcastBig = cursor + (direccionesPorBloqueBig - 1n);

    const network = binToIp(networkBin);
    const broadcast = binToIp(broadcastBig.toString(2).padStart(32, "0"));
    const firstHost = binToIp((cursor + 1n).toString(2).padStart(32, "0"));
    const lastHost = binToIp((broadcastBig - 1n).toString(2).padStart(32, "0"));

    resultadosHtml += `
      <tr>
        <td>Subred ${i}</td>
        <td>${network}</td>
        <td>${mascaraDecimal} (/${nuevoCIDR})</td>
        <td>${firstHost}</td>
        <td>${lastHost}</td>
        <td>${broadcast}</td>
        <td>${direccionesPorBloque}</td>
      </tr>
    `;

    subredes.push({
      index: i,
      network,
      mask: `/${nuevoCIDR}`,
      maskDecimal: mascaraDecimal,
      firstHost,
      lastHost,
      broadcast,
      direcCount: direccionesPorBloqueBig.toString()
    });

    cursor = broadcastBig + 1n;
  }

  resultadosHtml += "</table>";

  document.getElementById("flsmResultados").innerHTML = resumenHtml + resultadosHtml;

  const flsmDatos = {
    ip,
    cidrBase,
    cantidad,
    bitsSubred,
    nuevoCIDR,
    bitsHost,
    direccionesPorBloque: direccionesPorBloqueBig.toString(),
    hostsPorSubred,
    mascaraDecimal,
    subredes
  };
  localStorage.setItem("flsmDatos", JSON.stringify(flsmDatos));

  const btnPdf = document.getElementById("btn-pdf");
  if (btnPdf) {
    btnPdf.style.display = "inline-block";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btnPdf = document.getElementById("btn-pdf");
  if (!btnPdf) return;

  btnPdf.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const resultados = document.getElementById("flsmResultados");

    if (!resultados || resultados.innerHTML.trim() === "") {
      alert("Primero calcula para generar resultados.");
      return;
    }

    html2canvas(resultados, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save("resultado_FLSM.pdf");
    });
  });
});
