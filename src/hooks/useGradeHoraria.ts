import { useState, useCallback, useEffect } from 'react';
import {
  GradeSemanal,
  AulaGradeItem,
  gradeHorariaService,
} from '../servicos/GradeHorariaService';
import {
  HorarioAula,
  CriarHorarioAulaDTO,
  DiaSemana,
} from '../modelos/HorarioAula';
import { notificacaoService } from '../servicos/NotificacaoService';

export const useGradeHoraria = () => {
  const [gradeSemanal, setGradeSemanal] = useState<GradeSemanal>({
    SEGUNDA: [],
    TERCA: [],
    QUARTA: [],
    QUINTA: [],
    SEXTA: [],
    SABADO: [],
    DOMINGO: [],
  });
  const [aulasDeHoje, setAulasDeHoje] = useState<AulaGradeItem[]>([]);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarGrade = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      const grade = await gradeHorariaService.obterGradeSemanal();
      setGradeSemanal(grade);
      const hoje = await gradeHorariaService.obterAulasDeHoje();
      setAulasDeHoje(hoje);
    } catch (err: any) {
      setErro(err.message || 'Erro ao carregar grade horária.');
    } finally {
      setCarregando(false);
    }
  }, []);

  const obterHorariosDisciplina = useCallback(
    async (disciplinaId: string): Promise<HorarioAula[]> => {
      try {
        return await gradeHorariaService.listarPorDisciplina(disciplinaId);
      } catch (err: any) {
        setErro(err.message || 'Erro ao buscar horários da disciplina.');
        return [];
      }
    },
    []
  );

  const definirHorariosDisciplina = useCallback(
    async (
      disciplinaId: string,
      horarios: Omit<CriarHorarioAulaDTO, 'disciplinaId'>[]
    ) => {
      try {
        setCarregando(true);
        setErro(null);
        await gradeHorariaService.definirHorariosDisciplina(disciplinaId, horarios);
        await carregarGrade();
        notificacaoService.sincronizarGeral().catch(() => {});
      } catch (err: any) {
        setErro(err.message);
        throw err;
      } finally {
        setCarregando(false);
      }
    },
    [carregarGrade]
  );

  useEffect(() => {
    carregarGrade();
  }, [carregarGrade]);

  return {
    gradeSemanal,
    aulasDeHoje,
    carregando,
    erro,
    carregarGrade,
    obterHorariosDisciplina,
    definirHorariosDisciplina,
  };
};
