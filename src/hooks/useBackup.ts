import { useState, useCallback, useEffect } from 'react';
import {
  EstatisticasBackup,
  ModoRestauracao,
  ResultadoRestauracaoBackup,
  ResultadoValidacaoBackup,
} from '../modelos/Backup';
import { BackupService, backupService } from '../servicos/BackupService';

export const useBackup = (servico: BackupService = backupService) => {
  const [resumoLocal, setResumoLocal] = useState<EstatisticasBackup>({
    totalDisciplinas: 0,
    totalHorarios: 0,
    totalFaltas: 0,
    totalAvaliacoes: 0,
    totalTarefas: 0,
    totalEventos: 0,
  });

  const [carregando, setCarregando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const carregarResumo = useCallback(async () => {
    try {
      const estatisticas = await servico.obterResumoDadosAtuais();
      setResumoLocal(estatisticas);
    } catch (e: any) {
      console.error('Erro ao carregar resumo de dados locais:', e);
    }
  }, [servico]);

  useEffect(() => {
    carregarResumo();
  }, [carregarResumo]);

  const gerarBackup = async (): Promise<string> => {
    setCarregando(true);
    setErro(null);
    try {
      const json = await servico.gerarBackupJson();
      await carregarResumo();
      return json;
    } catch (e: any) {
      const msg = e?.message || 'Falha ao gerar o arquivo de backup.';
      setErro(msg);
      throw new Error(msg);
    } finally {
      setCarregando(false);
    }
  };

  const validarConteudo = (conteudoJson: string): ResultadoValidacaoBackup => {
    return servico.validarBackupJson(conteudoJson);
  };

  const restaurarBackup = async (
    conteudoJson: string,
    modo: ModoRestauracao = 'SUBSTITUIR'
  ): Promise<ResultadoRestauracaoBackup> => {
    setCarregando(true);
    setErro(null);
    setSucesso(null);
    try {
      const resultado = await servico.restaurarBackup(conteudoJson, modo);
      setSucesso(resultado.mensagem);
      await carregarResumo();
      return resultado;
    } catch (e: any) {
      const msg = e?.message || 'Falha ao restaurar o backup.';
      setErro(msg);
      throw new Error(msg);
    } finally {
      setCarregando(false);
    }
  };

  const limparMensagens = () => {
    setErro(null);
    setSucesso(null);
  };

  return {
    resumoLocal,
    carregando,
    erro,
    sucesso,
    carregarResumo,
    gerarBackup,
    validarConteudo,
    restaurarBackup,
    limparMensagens,
  };
};
