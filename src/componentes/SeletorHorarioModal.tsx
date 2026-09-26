import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  DiaSemana,
  DIAS_DA_SEMANA,
  DIAS_SEMANA_LABELS,
  DIAS_SEMANA_ABREV,
  CriarHorarioAulaDTO,
} from '../modelos/HorarioAula';
import { CampoTexto } from './CampoTexto';
import { Botao } from './Botao';
import { tema } from '../estilos/tema';

interface SeletorHorarioModalProps {
  visivel: boolean;
  horarioEdicao?: Omit<CriarHorarioAulaDTO, 'disciplinaId'> | null;
  aoFechar: () => void;
  aoSalvar: (horario: Omit<CriarHorarioAulaDTO, 'disciplinaId'>) => void;
}

export const SeletorHorarioModal: React.FC<SeletorHorarioModalProps> = ({
  visivel,
  horarioEdicao,
  aoFechar,
  aoSalvar,
}) => {
  const [diaSemana, setDiaSemana] = useState<DiaSemana>('SEGUNDA');
  const [horarioInicio, setHorarioInicio] = useState('08:00');
  const [horarioFim, setHorarioFim] = useState('09:40');
  const [localSala, setLocalSala] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    if (horarioEdicao) {
      setDiaSemana(horarioEdicao.diaSemana);
      setHorarioInicio(horarioEdicao.horarioInicio);
      setHorarioFim(horarioEdicao.horarioFim);
      setLocalSala(horarioEdicao.localSala || '');
    } else {
      setDiaSemana('SEGUNDA');
      setHorarioInicio('08:00');
      setHorarioFim('09:40');
      setLocalSala('');
    }
    setErros({});
  }, [horarioEdicao, visivel]);

  const formatarHora = (texto: string): string => {
    // Remove não números
    const numeros = texto.replace(/\D/g, '');
    if (numeros.length <= 2) return numeros;
    return `${numeros.slice(0, 2)}:${numeros.slice(2, 4)}`;
  };

  const validar = (): boolean => {
    const novosErros: Record<string, string> = {};
    const regexHora = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!regexHora.test(horarioInicio)) {
      novosErros.horarioInicio = 'Horário inválido (use HH:mm, ex: 08:00).';
    }

    if (!regexHora.test(horarioFim)) {
      novosErros.horarioFim = 'Horário inválido (use HH:mm, ex: 09:40).';
    }

    if (!novosErros.horarioInicio && !novosErros.horarioFim) {
      if (horarioInicio >= horarioFim) {
        novosErros.horarioFim = 'O término deve ser após o horário de início.';
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSalvar = () => {
    if (!validar()) return;

    aoSalvar({
      diaSemana,
      horarioInicio,
      horarioFim,
      localSala: localSala.trim() || undefined,
    });

    aoFechar();
  };

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={aoFechar}
    >
      <View style={estilos.overlay}>
        <View style={estilos.modalContainer}>
          <Text style={estilos.titulo}>
            {horarioEdicao ? 'Editar Horário de Aula' : 'Adicionar Horário de Aula'}
          </Text>
          <Text style={estilos.subtitulo}>
            Defina o dia da semana e o período da aula
          </Text>

          {/* Seleção do Dia da Semana */}
          <Text style={estilos.rotulo}>Dia da Semana</Text>
          <View style={estilos.gradeDias}>
            {DIAS_DA_SEMANA.map((dia) => {
              const ativo = diaSemana === dia;
              return (
                <TouchableOpacity
                  key={dia}
                  style={[estilos.chipDia, ativo ? estilos.chipDiaAtivo : null]}
                  onPress={() => setDiaSemana(dia)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      estilos.textoChipDia,
                      ativo ? estilos.textoChipDiaAtivo : null,
                    ]}
                  >
                    {DIAS_SEMANA_ABREV[dia]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={estilos.diaExtenso}>{DIAS_SEMANA_LABELS[diaSemana]}</Text>

          {/* Horários Início e Fim */}
          <View style={estilos.linhaHorarios}>
            <View style={estilos.colunaHorario}>
              <CampoTexto
                rotulo="Início (HH:mm)"
                placeholder="08:00"
                value={horarioInicio}
                onChangeText={(t) => setHorarioInicio(formatarHora(t))}
                keyboardType="numeric"
                maxLength={5}
                erro={erros.horarioInicio}
              />
            </View>
            <View style={estilos.colunaHorario}>
              <CampoTexto
                rotulo="Término (HH:mm)"
                placeholder="09:40"
                value={horarioFim}
                onChangeText={(t) => setHorarioFim(formatarHora(t))}
                keyboardType="numeric"
                maxLength={5}
                erro={erros.horarioFim}
              />
            </View>
          </View>

          {/* Local específico */}
          <CampoTexto
            rotulo="Sala / Laboratório (opcional)"
            placeholder="Ex: Lab 102 ou Bloco B"
            value={localSala}
            onChangeText={setLocalSala}
          />

          {/* Ações */}
          <View style={estilos.botoesContainer}>
            <View style={estilos.botaoWrapper}>
              <Botao titulo="Cancelar" variante="secundario" aoPressionar={aoFechar} />
            </View>
            <View style={estilos.botaoWrapper}>
              <Botao titulo="Confirmar" variante="primario" aoPressionar={handleSalvar} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const estilos = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: tema.espacamento.md,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.lg,
    borderWidth: 1,
    borderColor: tema.cores.bordaCard,
  },
  titulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.subtitulo,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitulo: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    marginBottom: tema.espacamento.md,
  },
  rotulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
    marginBottom: tema.espacamento.xs,
  },
  gradeDias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  chipDia: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.pequeno,
    borderWidth: 1,
    borderColor: tema.cores.bordaPadrao,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipDiaAtivo: {
    backgroundColor: tema.cores.corMarcaPrimaria,
    borderColor: tema.cores.corMarcaPrimaria,
  },
  textoChipDia: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    fontWeight: '600',
  },
  textoChipDiaAtivo: {
    color: tema.cores.corTextoPrimario,
    fontWeight: 'bold',
  },
  diaExtenso: {
    color: tema.cores.corMarcaPrimaria,
    fontSize: tema.tipografia.micro,
    fontWeight: '600',
    marginBottom: tema.espacamento.md,
    marginTop: 2,
  },
  linhaHorarios: {
    flexDirection: 'row',
    gap: tema.espacamento.md,
  },
  colunaHorario: {
    flex: 1,
  },
  botoesContainer: {
    flexDirection: 'row',
    gap: tema.espacamento.sm,
    marginTop: tema.espacamento.md,
  },
  botaoWrapper: {
    flex: 1,
  },
});
