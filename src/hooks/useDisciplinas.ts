import { useState, useEffect, useCallback } from 'react';
import { Disciplina, CriarDisciplinaDTO, AtualizarDisciplinaDTO } from '../modelos/Disciplina';
import { disciplinaService } from '../servicos/DisciplinaService';

export function useDisciplinas() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarDisciplinas = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      const lista = await disciplinaService.listarTodas();
      setDisciplinas(lista);
    } catch (err: any) {
      setErro(err.message || 'Erro ao carregar disciplinas.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDisciplinas();
  }, [carregarDisciplinas]);

  const criarDisciplina = async (dados: CriarDisciplinaDTO): Promise<Disciplina> => {
    try {
      const nova = await disciplinaService.criarDisciplina(dados);
      await carregarDisciplinas();
      return nova;
    } catch (err: any) {
      setErro(err.message);
      throw err;
    }
  };

  const atualizarDisciplina = async (id: string, dados: AtualizarDisciplinaDTO): Promise<Disciplina> => {
    try {
      const atualizada = await disciplinaService.atualizarDisciplina(id, dados);
      await carregarDisciplinas();
      return atualizada;
    } catch (err: any) {
      setErro(err.message);
      throw err;
    }
  };

  const excluirDisciplina = async (id: string): Promise<boolean> => {
    try {
      const sucesso = await disciplinaService.excluirDisciplina(id);
      await carregarDisciplinas();
      return sucesso;
    } catch (err: any) {
      setErro(err.message);
      throw err;
    }
  };

  return {
    disciplinas,
    carregando,
    erro,
    recarregarDisciplinas: carregarDisciplinas,
    criarDisciplina,
    atualizarDisciplina,
    excluirDisciplina,
  };
}
