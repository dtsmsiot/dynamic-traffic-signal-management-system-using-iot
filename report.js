let reports = [];
let monitoring = false;
let remainingSeconds = 0;
let countdown = null;
let chartInstance = null;


const tbody = document.getElementById("reportTable").querySelector("tbody");
const timer = document.getElementById("timer");
const summaryText = document.getElementById("summaryText");
const stopBtn = document.getElementById("stopBtn");
const excelBtn = document.getElementById("excelBtn");
const pdfBtn = document.getElementById("pdfBtn");
const policeNameEl = document.getElementById("policeName");

const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role.toLowerCase() !== "police" && currentUser.role.toLowerCase() !== "admin") {
    alert("You must be logged in as a police officer to access this page.");
    window.location.href = "login.html";
} else {
    policeNameEl.innerText = `${currentUser.name} (${currentUser.role})`;
}

const ARDUINO_IP = "10.228.178.72";
const ARDUINO_URL = `http://${ARDUINO_IP}/traffic`;


async function recordSignals() {
    if (!monitoring) return;

    try {
        const res = await fetch(ARDUINO_URL);
        const data = await res.json();

        const snapshot = {
            time: new Date().toLocaleTimeString(),
            lane1: data.lane[0],
            lane2: data.lane[1],
            lane3: data.lane[2],
            lane4: data.lane[3]
        };

        reports.push(snapshot);
        renderTable();
        updateChart();
    } catch (err) {
        console.error("Cannot fetch data", err);
        summaryText.innerText = "Cannot fetch data from ESP32. Check connection.";
    }
}


setInterval(recordSignals, 3000);

function startTimer(minutes) {
    if (monitoring) return;

    reports = [];
    renderTable();
    monitoring = true;
    remainingSeconds = minutes * 60;

    summaryText.innerText = `Collecting signal data for ${minutes} minute(s)...`;

    stopBtn.disabled = false;
    excelBtn.disabled = true;
    pdfBtn.disabled = true;

    updateTimer();

    countdown = setInterval(() => {
        remainingSeconds--;
        updateTimer();
        if (remainingSeconds <= 0) stopTimer("Time expired");
    }, 1000);
}

function stopTimerManual() { stopTimer("Stopped by user"); }

function stopTimer(reason = "Monitoring stopped") {
    clearInterval(countdown);
    monitoring = false;

    stopBtn.disabled = true;
    excelBtn.disabled = false;
    pdfBtn.disabled = false;

    summaryText.innerText = `${reason}. Collected ${reports.length} snapshots.`;
}


function updateTimer() {
    const mins = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
    const secs = String(remainingSeconds % 60).padStart(2, "0");
    timer.innerText = `${mins}:${secs}`;
}

function renderTable() {
    tbody.innerHTML = "";
    reports.forEach(r => {
        tbody.innerHTML += `
        <tr>
            <td>${r.time}</td>
            <td><span class="signal-dot" style="background:${r.lane1.toLowerCase()}"></span>${r.lane1}</td>
            <td><span class="signal-dot" style="background:${r.lane2.toLowerCase()}"></span>${r.lane2}</td>
            <td><span class="signal-dot" style="background:${r.lane3.toLowerCase()}"></span>${r.lane3}</td>
            <td><span class="signal-dot" style="background:${r.lane4.toLowerCase()}"></span>${r.lane4}</td>
        </tr>`;
    });
}


function updateChart() {
    if (chartInstance) chartInstance.destroy();

    const labels = reports.map(r => r.time);
    const datasets = ["lane1","lane2","lane3","lane4"].map((lane, i) => ({
        label: `Lane ${i+1}`,
        data: reports.map(r => r[lane] === "GREEN" ? 1 : r[lane] === "YELLOW" ? 0.5 : 0),
        borderColor: ["#2ecc71","#f1c40f","#e74c3c","#3498db"][i],
        fill: false,
        tension: 0.2
    }));

    chartInstance = new Chart(document.getElementById("trafficChart"), {
        type: "line",
        data: { labels, datasets },
        options: {
            responsive: true,
            plugins: { legend: { position: "top" } },
            scales: {
                y: { min: 0, max: 1, ticks: { stepSize: 0.5 } }
            }
        }
    });
}


function downloadExcel() {
    if (reports.length === 0) return alert("No data to export");
    const ws = XLSX.utils.json_to_sheet(reports);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Traffic Report");
    XLSX.writeFile(wb, `Traffic_Report_${currentUser.name}.xlsx`);
}


function downloadPDF() {
    if (reports.length === 0) return alert("No data to export");

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    pdf.setFontSize(14);
    pdf.text("Dynamic Traffic Signal Management System", 105, 15, { align: "center" });
    pdf.text(`Police Name: ${currentUser.name}`, 14, 25);
    pdf.text(`Role: ${currentUser.role}`, 14, 32);
    pdf.autoTable({
        startY: 40,
        head: [["Time","Lane 1","Lane 2","Lane 3","Lane 4"]],
        body: reports.map(r => [r.time, r.lane1, r.lane2, r.lane3, r.lane4])
    });
    pdf.save(`Traffic_Report_${currentUser.name}.pdf`);
}


function updateDateTime() {
    document.getElementById("dateTime").innerText = new Date().toLocaleString();
}
setInterval(updateDateTime, 1000);
updateDateTime();