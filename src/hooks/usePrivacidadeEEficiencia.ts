import { useState, useEffect, useCallback } from 'react';
import { DiagnosticoEficiencia } from '../modelos/EficienciaEnergetica';
import { RelatorioAuditoriaPrivacidade } from '../modelos/Privacidade';
import {
  EficienciaEnergeticaService,
  eficienciaEnergeticaService,
} from '../servicos/EficienciaEnergeticaService';
import {
  PrivacidadeService,
  privacidadeService,
} from '../servicos/PrivacidadeService';

/**
 * Hook para monitoramento e auditoria de Eficiência Energética (RNF04)
 * e Privacidade Total (RNF05).
 */
export function usePrivacidadeEEficiencia(
  servicoEficiencia: EficienciaEnergeticaService = eficienciaEnergeticaService,
  servicoPrivacidade: PrivacidadeService = privacidadeService
) {
  const [carregando, setCarregando] = useState<boolean>(true);
  const [diagnosticoEficiencia, setDiagnosticoEficiencia] =
    useState<DiagnosticoEficiencia | null>(null);
  const [relatorioPrivacidade, setRelatorioPrivacidade] =
    useState<RelatorioAuditoriaPrivacidade | null>(null);
  const [modalCertificadoVisivel, setModalCertificadoVisivel] =
    useState<boolean>(false);

  const carregarAuditorias = useCallback(async () => {
    try {
      setCarregando(true);
      const [diag, relatorio] = await Promise.all([
        servicoEficiencia.obterDiagnostico(),
        servicoPrivacidade.obterRelatorioAuditoria(),
      ]);
      setDiagnosticoEficiencia(diag);
      setRelatorioPrivacidade(relatorio);
    } catch (erro) {
      console.error('Erro ao carregar auditorias de privacidade e eficiência:', erro);
    } finally {
      setCarregando(false);
    }
  }, [servicoEficiencia, servicoPrivacidade]);

  useEffect(() => {
    carregarAuditorias();
  }, [carregarAuditorias]);

  const abrirModalCertificado = () => setModalCertificadoVisivel(true);
  const fecharModalCertificado = () => setModalCertificadoVisivel(false);

  return {
    carregando,
    diagnosticoEficiencia,
    relatorioPrivacidade,
    modalCertificadoVisivel,
    carregarAuditorias,
    abrirModalCertificado,
    fecharModalCertificado,
  };
}
