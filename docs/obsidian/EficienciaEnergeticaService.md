---
data: 2026-08-22
tipo: [arquitetura, regra-de-negocio]
tags: [campusflow, servico, eficiencia-energetica, rnf04, solid]
---

# EficienciaEnergeticaService

## Visão Geral

O **`EficienciaEnergeticaService`** é o serviço responsável por auditar, diagnosticar e certificar a conformidade do aplicativo com o requisito **[[RNF04 - Eficiência Energética]]**.

Garante que o CampusFlow opere sem rotinas ativas ou loops periódicos em segundo plano, utilizando o agendador nativo do sistema operacional e arquitetura orientada a eventos.

---

## 1. Contrato de Interface (`IEficienciaEnergeticaService`)

```typescript
export interface IEficienciaEnergeticaService {
  obterDiagnostico(): Promise<DiagnosticoEficiencia>;
  obterDiagnosticoSincrono(totalAlarmes?: number): DiagnosticoEficiencia;
  verificarConformidadeEficiencia(): boolean;
  auditarConsumoAlarmes(totalAlarmes?: number): {
    emConformidade: boolean;
    tipoAgendador: string;
    rotinasBackground: number;
    consumoBateriaEstimado: string;
    impactoBateriaPct: number;
  };
}
```

---

## 2. Métricas Auditadas

- **`rotinasSegundoPlanoAtivas`:** `0`
- **`usoWakeLocks`:** `0`
- **`tipoAgendador`:** `'Agendador Nativo do Sistema'` (AlarmManager / UNUserNotificationCenter)
- **`consumoBateriaEstimado`:** `'Mínimo / Quase Nulo'` (< 0.1% ao dia)
- **`processamentoEventDriven`:** `true`

---

## 3. Integração na Interface

- Consumido pelo hook `[[usePrivacidadeEEficiencia]]`.
- Renderizado visualmente no componente `[[CardEficienciaEnergetica]]` na tela de Ajustes (`TelaAjustes`).
