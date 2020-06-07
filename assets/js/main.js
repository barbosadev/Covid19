var vm = new Vue({
    el: '#app',
    data: {
        casosConfirmadosNoBrasil: [],
        recuperadosNoBrasil: [],
        mortesNoBrasil: [],
        dias: [],
    },
    methods: {
        getDadosBrasil() {
            fetch("https://pomber.github.io/covid19/timeseries.json")
                .then(r => r.json())
                .then(r => {
                    r['Brazil'].forEach(dado => {
                        if (dado['confirmed'] > 0) {
                            this.dias.push(this.formatarData(dado['date']));
                            this.casosConfirmadosNoBrasil.push(dado['confirmed']);
                            this.mortesNoBrasil.push(dado['deaths']);
                            this.recuperadosNoBrasil.push(dado['recovered']);
                        }
                    });
                });

        },
        formatarData(data) {
            numeros = data.split('-');
            dataFormatada = `${numeros[2]}/${numeros[1]}/${numeros[0]}`;
            return dataFormatada;
        },
    },
    created() {
        this.getDadosBrasil();
    },
    filters: {
        formatarNumero(numero) {
            return numero.toLocaleString('pt-BR');
        }
    },
    computed: {
        totalCasosConfirmadosNoBrasil() {
            if (this.casosConfirmadosNoBrasil.length > 0) {
                return this.casosConfirmadosNoBrasil[this.casosConfirmadosNoBrasil.length - 1];
            }
            else {
                return 0;
            }
        },
        totalCasosRecuperadosNoBrasil() {
            if (this.recuperadosNoBrasil.length > 0) {
                return this.recuperadosNoBrasil[this.recuperadosNoBrasil.length - 1];
            }
            else {
                return 0;
            }
        },
        totalMortesNoBrasil() {
            if (this.mortesNoBrasil.length > 0) {
                return this.mortesNoBrasil[this.mortesNoBrasil.length - 1];
            }
            else {
                return 0;
            }
        },

    }
});


let obitosNoBrasil = 0, casosNoBrasil = 0;
let horariosAtualizacao = [];

function formatarValor(valor) {
    return valor.toLocaleString('pt-BR');
}

function formatarData(data) {
    numeros = data.split('-');
    dataFormatada = `${numeros[2]}/${numeros[1]}/${numeros[0]}`;
    return dataFormatada;
}

function ultimaAtualizacao() {
    let dataAtulizacao = new Date((horariosAtualizacao.sort()).pop());
    let dataAtual = new Date();
    let timeDiff = Math.abs(dataAtual.getTime() - dataAtulizacao.getTime());
    let diffDays = Math.ceil(timeDiff / (1000 * 60));
    if (diffDays > 60) {
        diffDays = Math.ceil(timeDiff / (1000 * 60 * 60));
        document.querySelector('.atualizado').innerHTML = `Atualizado há menos de ${diffDays} horas`;
    } else {
        document.querySelector('.atualizado').innerHTML = `Atualizado há ${diffDays} minutos`;
    }
    //return diffDays;
}

function alimentaEstados(dados) {
    dados.forEach(element => {

        let dadosBuscar = ['state', 'cases', 'deaths'];
        let linha, coluna, texto;

        linha = document.createElement('tr');
        dadosBuscar.forEach(dadoBusca => {
            coluna = document.createElement('td');
            texto = document.createTextNode(element[dadoBusca]);
            coluna.appendChild(texto);
            linha.appendChild(coluna);

            obitosNoBrasil += (dadoBusca == 'deaths') ? element[dadoBusca] : 0;
            casosNoBrasil += (dadoBusca == 'cases') ? element[dadoBusca] : 0;
        });
        horariosAtualizacao.push(element['datetime']);
        document.querySelector("tbody").appendChild(linha);
    });
    desenharDoughnutBrasil();
}

let casosNoMundo = 0, curadosNoMundo = 0, curadosNoBrasil = 0, obitosNoMundo = 0;

function mundo(dados) {
    dados.forEach(element => {
        let dadosBuscar = ['country', 'cases', 'confirmed', 'deaths', 'recovered'];
        curadosNoBrasil = (element['country'] == 'Brazil') ? element['recovered'] : curadosNoBrasil;
        dadosBuscar.forEach(dadoBusca => {
            casosNoMundo += (dadoBusca == 'confirmed') ? element[dadoBusca] : 0;
            curadosNoMundo += (dadoBusca == 'recovered') ? element[dadoBusca] : 0;
            obitosNoMundo += (dadoBusca == 'deaths') ? element[dadoBusca] : 0;
        });
        horariosAtualizacao.push(element['updated_at']);
    });

    document.querySelector('.curados_brasil').innerHTML = formatarValor(curadosNoBrasil);
    document.querySelector('.casos_mundo').innerHTML = formatarValor(casosNoMundo);
    document.querySelector('.curados_mundo').innerHTML = formatarValor(curadosNoMundo);
    document.querySelector('.obitos_mundo').innerHTML = formatarValor(obitosNoMundo);
    desenharDoughnutMundo();
    desenharDoughnutBrasil();
}

let dias = [], casosConfirmados = [], mortes = [], curados = [];
function graficoBrasil(dados) {
    dados.forEach(dado => {
        if (dado['confirmed'] > 0) {
            dias.push(formatarData(dado['date']));
            casosConfirmados.push(dado['confirmed']);
            mortes.push(dado['deaths']);
            curados.push(dado['recovered']);
        }
    });
}

function arrayPeriodo(periodo, dados) {
    let novoPeriodo = [];
    for (let i = dados.length + 1 - periodo; i <= dados.length; i++) {
        novoPeriodo.push(dados[i - 1]);
    }
    return novoPeriodo;
}

var canvas = document.getElementById('myChart');
const ctx = canvas.getContext('2d');
var chart;
function desenha(tamanhoPeriodo) {
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: arrayPeriodo(tamanhoPeriodo, dias),
            datasets: [{
                label: 'Confirmados',
                data: arrayPeriodo(tamanhoPeriodo, casosConfirmados),
                borderColor: '#dbba34',
                backgroundColor: 'rgba(219, 186, 52, 1)',
                fill: false
            },
            {
                label: "Mortes",
                data: arrayPeriodo(tamanhoPeriodo, mortes),
                borderColor: '#c62f29',
                backgroundColor: 'rgba(198, 47, 41, 1)',
                fill: false
            },
            {
                label: "Curados",
                data: arrayPeriodo(tamanhoPeriodo, curados),
                borderColor: '#637b85',
                backgroundColor: 'rgba(99, 123, 133, 1)',
                fill: false
            }]
        },
    });
}
let desenhouDoughnutMundo = false;
function desenharDoughnutMundo() {
    if (casosNoMundo != 0 && curadosNoMundo != 0 && obitosNoMundo != 0 && desenhouDoughnutMundo === false) {
        desenhouDoughnutMundo = true;
        new Chart(document.getElementById("doughnut-chart-mundo"), {
            type: 'doughnut',
            data: {
                labels: ["Casos Ativos", "Curados", "Óbitos"],
                datasets: [
                    {
                        label: "Population (millions)",
                        backgroundColor: ["#fff3cd", "#d1ecf1", "#f8d7da"],
                        data: [(casosNoMundo - curadosNoMundo - obitosNoMundo), curadosNoMundo, obitosNoMundo]
                    }
                ]
            },
        });
    }
}
let desenhouDoughnutBrasil = false;
function desenharDoughnutBrasil() {
    console.log(casosNoBrasil, curadosNoBrasil, obitosNoBrasil);
    if (casosNoBrasil != 0 && curadosNoBrasil != 0 && obitosNoBrasil != 0 && desenhouDoughnutBrasil === false) {
        desenhouDoughnutBrasil = true;
        new Chart(document.getElementById("doughnut-chart-brasil"), {
            type: 'doughnut',
            data: {
                labels: ["Casos Ativos", "Curados", "Óbitos"],
                datasets: [
                    {
                        label: "Population (millions)",
                        backgroundColor: ["#fff3cd", "#d1ecf1", "#f8d7da"],
                        data: [(casosNoBrasil - curadosNoBrasil - obitosNoBrasil), curadosNoBrasil, obitosNoBrasil]
                    }
                ]
            },
        });
    }
}

function removeData(chart) {
    for (let i = chart.data.labels.length; i > 0; i--) {
        chart.data.labels.pop();
        chart.data.datasets.forEach((dataset) => { dataset.data.pop(); });
    }
    chart.update();
}
function addData(chart, label, data, data2, data3, periodo) {
    label = arrayPeriodo(periodo, label);
    data = arrayPeriodo(periodo, data);
    data2 = arrayPeriodo(periodo, data2);
    data3 = arrayPeriodo(periodo, data3);
    label.forEach(element => { chart.data.labels.push(element); });
    data.forEach(element => { chart.data.datasets[0].data.push(element); });
    data2.forEach(element => { chart.data.datasets[1].data.push(element); });
    data3.forEach(element => { chart.data.datasets[2].data.push(element); });
    chart.update();
}

fetch("https://covid19-brazil-api.now.sh/api/report/v1", {
    "method": "GET"
})
    .then(response => {
        response.json()
            .then(result => {
                alimentaEstados(result.data)
            })
    })
    .catch(err => console.error(err));

fetch("https://covid19-brazil-api.now.sh/api/report/v1/countries", {
    "method": "GET"
})
    .then(response => {
        response.json()
            .then(result => {
                mundo(result.data);
                ultimaAtualizacao();
            })
    })
    .catch(err => console.error(err));

fetch("https://pomber.github.io/covid19/timeseries.json", {
    "method": "GET"
})
    .then(response => {
        response.json()
            .then(result => {
                graficoBrasil(result['Brazil']);
                desenha(selectPeriodo.value);
            })
    })
    .catch(err => console.error(err));

let selectPeriodo = document.querySelector('#selectPeriodo');
selectPeriodo.addEventListener('change', () => {
    let periodo = (selectPeriodo.value === 'all') ? dias.length : selectPeriodo.value;
    removeData(chart);
    addData(chart, dias, casosConfirmados, mortes, curados, periodo);
});