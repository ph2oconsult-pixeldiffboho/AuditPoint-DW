export const SAMPLE_PLANT = `Plant: Riverbend Water Treatment Plant
Source: surface water (river), single source
Rated capacity: 45 ML/d; current average throughput: 41 ML/d
Process train: coagulation/flocculation (alum) -> DAF clarification -> rapid gravity filtration -> GAC -> UV disinfection -> chlorination -> pH correction
Residuals: DAF sludge to gravity thickener -> centrifuge dewatering; spent backwash recycled to head of works without treatment
Chemicals: alum (coagulant), polymer (DAF + dewatering), chlorine gas, sodium hydroxide (pH), fluorosilicic acid

Raw water (last 3 years, daily):
- Turbidity NTU: mean 8.2, median 4.1, 95th 31, max 210, CV 1.6 (spikes after rainfall)
- Colour HU: mean 22, 95th 48
- TOC mg/L: mean 4.6, 95th 7.1
- Manganese mg/L: mean 0.06, 95th 0.18
- pH: mean 7.4, CV 0.07
- Algae: seasonal blooms Nov-Feb

Operations / SCADA (12 months):
- Filtration rate frequently 13-15 m/h against design 10 m/h during peak demand
- Filtered water turbidity: mean 0.09 NTU, 95th 0.21 NTU
- UV: single reactor, no standby unit; validated dose maintained
- Chlorine residual leaving plant: mean 1.1 mg/L
- Centrifuge cake: 18-20% DS; polymer dose recorded but not flow-paced
- Backwash recycle estimated 6% of plant flow; no settling before return

Compliance: meets current limits on treated water. No formal HACCP/Water Safety Plan provided.
Assets: SCADA system ~15 years old; limited remote monitoring. Asset register and maintenance records not provided.`;
