import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { tema } from '../estilos/tema';

interface ModalSeletorDataProps {
  visivel: boolean;
  dataSelecionada?: string; // Formato AAAA-MM-DD
  aoFechar: () => void;
  aoConfirmar: (dataStr: string) => void;
  titulo?: string;
  permiteLimpar?: boolean;
}

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const DIAS_SEMANA_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const ModalSeletorData: React.FC<ModalSeletorDataProps> = ({
  visivel,
  dataSelecionada,
  aoFechar,
  aoConfirmar,
  titulo = 'Selecionar Data',
  permiteLimpar = false,
}) => {
  const [dataTemp, setDataTemp] = useState<string>('');
  const [anoVisualizacao, setAnoVisualizacao] = useState<number>(new Date().getFullYear());
  const [mesVisualizacao, setMesVisualizacao] = useState<number>(new Date().getMonth());

  // Inicializa quando o modal se torna visível
  useEffect(() => {
    if (visivel) {
      const hoje = new Date();
      if (dataSelecionada && /^\d{4}-\d{2}-\d{2}$/.test(dataSelecionada)) {
        setDataTemp(dataSelecionada);
        const [ano, mes] = dataSelecionada.split('-').map(Number);
        setAnoVisualizacao(ano);
        setMesVisualizacao(mes - 1);
      } else {
        const ano = hoje.getFullYear();
        const mes = hoje.getMonth();
        const dia = hoje.getDate();
        const hojeStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        setDataTemp(hojeStr);
        setAnoVisualizacao(ano);
        setMesVisualizacao(mes);
      }
    }
  }, [visivel, dataSelecionada]);

  // Formata data ISO AAAA-MM-DD
  const formatarISO = (ano: number, mes: number, dia: number): string => {
    return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
  };

  const hoje = useMemo(() => {
    const d = new Date();
    return formatarISO(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const amanha = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatarISO(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const maisSeteDias = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return formatarISO(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  // Navegar meses
  const mesAnterior = () => {
    if (mesVisualizacao === 0) {
      setMesVisualizacao(11);
      setAnoVisualizacao((a) => a - 1);
    } else {
      setMesVisualizacao((m) => m - 1);
    }
  };

  const proximoMes = () => {
    if (mesVisualizacao === 11) {
      setMesVisualizacao(0);
      setAnoVisualizacao((a) => a + 1);
    } else {
      setMesVisualizacao((m) => m + 1);
    }
  };

  // Matriz de dias do mês
  const matrizDias = useMemo(() => {
    const dias: { dia: number; mes: number; ano: number; dataStr: string; ehMesAtual: boolean }[] = [];

    // Primeiro dia da semana do mês (0 = Dom, 1 = Seg...)
    const primeiroDia = new Date(anoVisualizacao, mesVisualizacao, 1).getDay();
    // Total de dias no mês atual
    const totalDiasMes = new Date(anoVisualizacao, mesVisualizacao + 1, 0).getDate();
    // Total de dias no mês anterior
    const totalDiasMesAnterior = new Date(anoVisualizacao, mesVisualizacao, 0).getDate();

    // Dias do mês anterior
    for (let i = primeiroDia - 1; i >= 0; i--) {
      const diaNum = totalDiasMesAnterior - i;
      const mesNum = mesVisualizacao === 0 ? 11 : mesVisualizacao - 1;
      const anoNum = mesVisualizacao === 0 ? anoVisualizacao - 1 : anoVisualizacao;
      dias.push({
        dia: diaNum,
        mes: mesNum,
        ano: anoNum,
        dataStr: formatarISO(anoNum, mesNum, diaNum),
        ehMesAtual: false,
      });
    }

    // Dias do mês atual
    for (let diaNum = 1; diaNum <= totalDiasMes; diaNum++) {
      dias.push({
        dia: diaNum,
        mes: mesVisualizacao,
        ano: anoVisualizacao,
        dataStr: formatarISO(anoVisualizacao, mesVisualizacao, diaNum),
        ehMesAtual: true,
      });
    }

    // Dias do próximo mês para fechar a grade (múltiplo de 7)
    const resto = dias.length % 7;
    if (resto > 0) {
      const faltam = 7 - resto;
      for (let diaNum = 1; diaNum <= faltam; diaNum++) {
        const mesNum = mesVisualizacao === 11 ? 0 : mesVisualizacao + 1;
        const anoNum = mesVisualizacao === 11 ? anoVisualizacao + 1 : anoVisualizacao;
        dias.push({
          dia: diaNum,
          mes: mesNum,
          ano: anoNum,
          dataStr: formatarISO(anoNum, mesNum, diaNum),
          ehMesAtual: false,
        });
      }
    }

    return dias;
  }, [anoVisualizacao, mesVisualizacao]);

  const handleSelecionar = (dataStr: string) => {
    setDataTemp(dataStr);
    const [ano, mes] = dataStr.split('-').map(Number);
    setAnoVisualizacao(ano);
    setMesVisualizacao(mes - 1);
  };

  const handleConfirmar = () => {
    aoConfirmar(dataTemp);
    aoFechar();
  };

  const handleLimpar = () => {
    aoConfirmar('');
    aoFechar();
  };

  // Formatação amigável para o cabeçalho
  const dataFormatadaTexto = useMemo(() => {
    if (!dataTemp || !/^\d{4}-\d{2}-\d{2}$/.test(dataTemp)) return 'Nenhuma data selecionada';
    const [ano, mes, dia] = dataTemp.split('-').map(Number);
    return `${dia} de ${MESES[mes - 1]} de ${ano}`;
  }, [dataTemp]);

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={aoFechar}
    >
      <TouchableWithoutFeedback onPress={aoFechar}>
        <View style={estilos.backdrop}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={estilos.containerModal}>
              {/* Cabeçalho do Modal */}
              <View style={estilos.cabecalhoModal}>
                <View>
                  <Text style={estilos.tituloModal}>{titulo}</Text>
                  <Text style={estilos.subtituloData}>{dataFormatadaTexto}</Text>
                </View>
                <TouchableOpacity
                  style={estilos.botaoFechar}
                  onPress={aoFechar}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={estilos.textoFechar}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Atalhos Rápidos */}
              <View style={estilos.linhaAtalhos}>
                <TouchableOpacity
                  style={[estilos.chipAtalho, dataTemp === hoje && estilos.chipAtalhoAtivo]}
                  onPress={() => handleSelecionar(hoje)}
                >
                  <Text style={[estilos.textoChipAtalho, dataTemp === hoje && estilos.textoChipAtalhoAtivo]}>
                    Hoje
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[estilos.chipAtalho, dataTemp === amanha && estilos.chipAtalhoAtivo]}
                  onPress={() => handleSelecionar(amanha)}
                >
                  <Text style={[estilos.textoChipAtalho, dataTemp === amanha && estilos.textoChipAtalhoAtivo]}>
                    Amanhã
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[estilos.chipAtalho, dataTemp === maisSeteDias && estilos.chipAtalhoAtivo]}
                  onPress={() => handleSelecionar(maisSeteDias)}
                >
                  <Text style={[estilos.textoChipAtalho, dataTemp === maisSeteDias && estilos.textoChipAtalhoAtivo]}>
                    +7 dias
                  </Text>
                </TouchableOpacity>

                {permiteLimpar && (
                  <TouchableOpacity
                    style={[estilos.chipAtalho, !dataTemp && estilos.chipAtalhoAtivo]}
                    onPress={() => setDataTemp('')}
                  >
                    <Text style={[estilos.textoChipAtalho, !dataTemp && estilos.textoChipAtalhoAtivo]}>
                      Sem Data
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Barra de Navegação do Mês */}
              <View style={estilos.barraNavegacaoMes}>
                <TouchableOpacity
                  style={estilos.botaoSetaMes}
                  onPress={mesAnterior}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={estilos.textoSeta}>‹</Text>
                </TouchableOpacity>

                <Text style={estilos.textoMesAno}>
                  {MESES[mesVisualizacao]} {anoVisualizacao}
                </Text>

                <TouchableOpacity
                  style={estilos.botaoSetaMes}
                  onPress={proximoMes}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={estilos.textoSeta}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Cabeçalho dos Dias da Semana */}
              <View style={estilos.linhaDiasSemana}>
                {DIAS_SEMANA_ABREV.map((diaAbrev, index) => (
                  <View key={index} style={estilos.colunaDiaSemana}>
                    <Text style={estilos.textoDiaSemana}>{diaAbrev}</Text>
                  </View>
                ))}
              </View>

              {/* Grade de Dias */}
              <View style={estilos.gridDias}>
                {matrizDias.map((item) => {
                  const selecionado = dataTemp === item.dataStr;
                  const ehHoje = item.dataStr === hoje;

                  return (
                    <TouchableOpacity
                      key={item.dataStr}
                      style={[
                        estilos.celulaDia,
                        !item.ehMesAtual && estilos.celulaMesAdjacente,
                        ehHoje && estilos.celulaHoje,
                        selecionado && estilos.celulaSelecionada,
                      ]}
                      onPress={() => handleSelecionar(item.dataStr)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          estilos.textoNumeroDia,
                          !item.ehMesAtual && estilos.textoNumeroMesAdjacente,
                          ehHoje && estilos.textoNumeroHoje,
                          selecionado && estilos.textoNumeroSelecionado,
                        ]}
                      >
                        {item.dia}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Botões de Ação */}
              <View style={estilos.linhaBotoes}>
                {permiteLimpar && (
                  <TouchableOpacity
                    style={estilos.botaoLimpar}
                    onPress={handleLimpar}
                    activeOpacity={0.8}
                  >
                    <Text style={estilos.textoBotaoLimpar}>Limpar</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={estilos.botaoCancelar}
                  onPress={aoFechar}
                  activeOpacity={0.8}
                >
                  <Text style={estilos.textoBotaoCancelar}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={estilos.botaoConfirmar}
                  onPress={handleConfirmar}
                  activeOpacity={0.8}
                >
                  <Text style={estilos.textoBotaoConfirmar}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const estilos = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: tema.espacamento.md,
  },
  containerModal: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.md,
    borderWidth: 1,
    borderColor: '#30363d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  cabecalhoModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tema.espacamento.sm,
  },
  tituloModal: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.subtitulo,
    fontWeight: 'bold',
  },
  subtituloData: {
    color: tema.cores.corMarcaPrimaria,
    fontSize: tema.tipografia.micro + 1,
    fontWeight: '600',
    marginTop: 2,
  },
  botaoFechar: {
    padding: 4,
  },
  textoFechar: {
    color: tema.cores.corTextoSecundario,
    fontSize: 16,
    fontWeight: '600',
  },
  linhaAtalhos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: tema.espacamento.sm + 2,
  },
  chipAtalho: {
    backgroundColor: tema.cores.corFundoElevado,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: tema.raioBorda.pequeno,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  chipAtalhoAtivo: {
    backgroundColor: `${tema.cores.corMarcaPrimaria}25`,
    borderColor: tema.cores.corMarcaPrimaria,
  },
  textoChipAtalho: {
    color: tema.cores.corTextoSecundario,
    fontSize: 11,
    fontWeight: '600',
  },
  textoChipAtalhoAtivo: {
    color: tema.cores.corMarcaPrimaria,
    fontWeight: '700',
  },
  barraNavegacaoMes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.padrao,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: tema.espacamento.sm,
  },
  botaoSetaMes: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  textoSeta: {
    color: tema.cores.corTextoPrimario,
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  textoMesAno: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700',
  },
  linhaDiasSemana: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: tema.cores.bordaCard,
    paddingBottom: 6,
    marginBottom: 4,
  },
  colunaDiaSemana: {
    flex: 1,
    alignItems: 'center',
  },
  textoDiaSemana: {
    color: tema.cores.corTextoSecundario,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  gridDias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: tema.espacamento.md,
  },
  celulaDia: {
    width: '14.28%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tema.raioBorda.pequeno,
  },
  celulaMesAdjacente: {
    opacity: 0.3,
  },
  celulaHoje: {
    borderWidth: 1,
    borderColor: tema.cores.corMarcaPrimaria,
  },
  celulaSelecionada: {
    backgroundColor: tema.cores.corMarcaPrimaria,
  },
  textoNumeroDia: {
    color: tema.cores.corTextoPrimario,
    fontSize: 13,
    fontWeight: '600',
  },
  textoNumeroMesAdjacente: {
    color: tema.cores.corTextoSecundario,
  },
  textoNumeroHoje: {
    color: tema.cores.corMarcaPrimaria,
    fontWeight: '800',
  },
  textoNumeroSelecionado: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  linhaBotoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: tema.cores.bordaCard,
    paddingTop: tema.espacamento.sm,
  },
  botaoLimpar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 'auto',
  },
  textoBotaoLimpar: {
    color: tema.cores.corStatusCritico,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  botaoCancelar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: tema.raioBorda.padrao,
  },
  textoBotaoCancelar: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  botaoConfirmar: {
    backgroundColor: tema.cores.corMarcaPrimaria,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: tema.raioBorda.padrao,
  },
  textoBotaoConfirmar: {
    color: '#ffffff',
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700',
  },
});
