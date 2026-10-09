#!/usr/bin/env bash
# Copy papers, figures and course notes from the old wikidot site into this repository.
# Run once from the repository root, check the output, then commit:
#
#   bash scripts/fetch-assets.sh
#   git add static && git commit -m "Add papers and figures from wikidot"
#
# Files that already exist are skipped, so it is safe to re-run.
# To list what is still missing without downloading anything:
#
#   bash scripts/fetch-assets.sh --check
set -u
cd "$(dirname "$0")/.."

FILES=(
  "https://abag.wdfiles.com/local--files/publications/Kreczak_MarinePollution.pdf|static/papers/Kreczak_MarinePollution.pdf"
  "https://abag.wdfiles.com/local--files/publications/Wadkin_OPM2|static/papers/Wadkin_OPM2.pdf"
  "https://abag.wdfiles.com/local--files/publications/qvort_dissipation_anomaly.pdf|static/papers/qvort_dissipation_anomaly.pdf"
  "https://abag.wdfiles.com/local--files/publications/Wadkin_OPM1.pdf|static/papers/Wadkin_OPM1.pdf"
  "https://abag.wdfiles.com/local--files/publications/Grimes_bundle.pdf|static/papers/Grimes_bundle.pdf"
  "https://abag.wdfiles.com/local--files/publications/Kreczak_plastic1.pdf|static/papers/Kreczak_plastic1.pdf"
  "https://abag.wdfiles.com/local--files/publications/Galantucci_helicity.pdf|static/papers/Galantucci_helicity.pdf"
  "https://abag.wdfiles.com/local--files/publications/Wadkin_2021_Phys._Biol._18_026003.pdf|static/papers/Wadkin_2021_Phys._Biol._18_026003.pdf"
  "https://abag.wdfiles.com/local--files/publications/Galantucci_leapfrog.pdf|static/papers/Galantucci_leapfrog.pdf"
  "https://abag.wdfiles.com/local--files/publications/Rickinson_radial_counterflow.pdf|static/papers/Rickinson_radial_counterflow.pdf"
  "https://abag.wdfiles.com/local--files/publications/GalantucciFOUCAULT.pdf|static/papers/GalantucciFOUCAULT.pdf"
  "https://abag.wdfiles.com/local--files/publications/LauriePressure.pdf|static/papers/LauriePressure.pdf"
  "https://abag.wdfiles.com/local--files/publications/quantum_knots.pdf|static/papers/quantum_knots.pdf"
  "https://abag.wdfiles.com/local--files/publications/Sirio_stem_cell1.pdf|static/papers/Sirio_stem_cell1.pdf"
  "https://abag.wdfiles.com/local--files/publications/PNAS_recon.pdf|static/papers/PNAS_recon.pdf"
  "https://abag.wdfiles.com/local--files/publications/3Ddiffusion.pdf|static/papers/3Ddiffusion.pdf"
  "https://abag.wdfiles.com/local--files/publications/IntegratingQualitativeAndSocialFactos.pdf|static/papers/IntegratingQualitativeAndSocialFactos.pdf"
  "https://abag.wdfiles.com/local--files/publications/tree_disease_lattice.pdf|static/papers/tree_disease_lattice.pdf"
  "https://abag.wdfiles.com/local--files/publications/QFerrofluid_turb.pdf|static/papers/QFerrofluid_turb.pdf"
  "https://abag.wdfiles.com/local--files/publications/BEC_2D_diffusion.pdf|static/papers/BEC_2D_diffusion.pdf"
  "https://abag.wdfiles.com/local--files/publications/KHinstability.pdf|static/papers/KHinstability.pdf"
  "https://abag.wdfiles.com/local--files/publications/BEC_2D_decay.pdf|static/papers/BEC_2D_decay.pdf"
  "https://abag.wdfiles.com/local--files/publications/ABC_Gyrotaxis.pdf|static/papers/ABC_Gyrotaxis.pdf"
  "https://abag.wdfiles.com/local--files/publications/Mae_helicity.pdf|static/papers/Mae_helicity.pdf"
  "https://abag.wdfiles.com/local--files/publications/quasi_lancaster_long.pdf|static/papers/quasi_lancaster_long.pdf"
  "https://abag.wdfiles.com/local--files/publications/NoCascade.pdf|static/papers/NoCascade.pdf"
  "https://abag.wdfiles.com/local--files/publications/spin_flock.pdf|static/papers/spin_flock.pdf"
  "https://abag.wdfiles.com/local--files/publications/qvort_ring_prop.pdf|static/papers/qvort_ring_prop.pdf"
  "https://abag.wdfiles.com/local--files/publications/qvort_recon_MF.pdf|static/papers/qvort_recon_MF.pdf"
  "https://abag.wdfiles.com/local--files/publications/quasi_lancaster.pdf|static/papers/quasi_lancaster.pdf"
  "https://abag.wdfiles.com/local--files/publications/TGV_flocking.pdf|static/papers/TGV_flocking.pdf"
  "https://abag.wdfiles.com/local--files/publications/qvort_local_nonlocal.pdf|static/papers/qvort_local_nonlocal.pdf"
  "https://abag.wdfiles.com/local--files/publications/laurie_channel1.pdf|static/papers/laurie_channel1.pdf"
  "https://abag.wdfiles.com/local--files/publications/wacks_rings_2.pdf|static/papers/wacks_rings_2.pdf"
  "https://abag.wdfiles.com/local--files/publications/henderson_antiquity.pdf|static/papers/henderson_antiquity.pdf"
  "https://abag.wdfiles.com/local--files/publications/risto_PNAS.pdf|static/papers/risto_PNAS.pdf"
  "https://abag.wdfiles.com/local--files/publications/qvort_acc_stat.pdf|static/papers/qvort_acc_stat.pdf"
  "https://abag.wdfiles.com/local--files/publications/wacks_ring_paper.pdf|static/papers/wacks_ring_paper.pdf"
  "https://abag.wdfiles.com/local--files/publications/KWC_Laurie.pdf|static/papers/KWC_Laurie.pdf"
  "https://abag.wdfiles.com/local--files/publications/qvort_inverse.pdf|static/papers/qvort_inverse.pdf"
  "https://abag.wdfiles.com/local--files/publications/channel.pdf|static/papers/channel.pdf"
  "https://abag.wdfiles.com/local--files/publications/neo_stats.pdf|static/papers/neo_stats.pdf"
  "https://abag.wdfiles.com/local--files/publications/zuccher_recon.pdf|static/papers/zuccher_recon.pdf"
  "https://abag.wdfiles.com/local--files/publications/qvort_smooth.pdf|static/papers/qvort_smooth.pdf"
  "https://abag.wdfiles.com/local--files/publications/qvort_counterflow.pdf|static/papers/qvort_counterflow.pdf"
  "https://abag.wdfiles.com/local--files/publications/neo_applied.pdf|static/papers/neo_applied.pdf"
  "https://abag.wdfiles.com/local--files/publications/quasi_ring.pdf|static/papers/quasi_ring.pdf"
  "https://abag.wdfiles.com/local--files/publications/criss_cross_bundle.pdf|static/papers/criss_cross_bundle.pdf"
  "https://abag.wdfiles.com/local--files/publications/structures.pdf|static/papers/structures.pdf"
  "https://abag.wdfiles.com/local--files/publications/qvort_recon.pdf|static/papers/qvort_recon.pdf"
  "https://abag.wdfiles.com/local--files/publications/qvort_decay.pdf|static/papers/qvort_decay.pdf"
  "https://abag.wdfiles.com/local--files/publications/qvort_paper.pdf|static/papers/qvort_paper.pdf"
  "https://abag.wdfiles.com/local--files/publications/qvort_vel_stat.pdf|static/papers/qvort_vel_stat.pdf"
  "https://abag.wdfiles.com/local--files/publications/qvort_fluc.pdf|static/papers/qvort_fluc.pdf"
  "https://abag.wdfiles.com/local--files/publications/KWC_PRB.pdf|static/papers/KWC_PRB.pdf"
  "https://abag.wdfiles.com/local--files/publications/Baggaley_AN_09.pdf|static/papers/Baggaley_AN_09.pdf"
  "https://abag.wdfiles.com/local--files/publications/FRD_PRE.pdf|static/papers/FRD_PRE.pdf"
  "https://abag.wdfiles.com/local--files/publications/Stretching.pdf|static/papers/Stretching.pdf"
  "https://abag.wdfiles.com/local--files/start/CV.pdf|static/files/CV.pdf"
  "https://abag.wdfiles.com/local--files/math-biology/Tree_snap.png|static/img/math-biology/Tree_snap.png"
  "https://abag.wdfiles.com/local--files/math-biology/Sirio_snap.png|static/img/math-biology/Sirio_snap.png"
  "https://abag.wdfiles.com/local--files/math-biology/spinflock.png|static/img/math-biology/spinflock.png"
  "https://abag.wdfiles.com/local--files/math-biology/Neo_snap.png|static/img/math-biology/Neo_snap.png"
  "https://abag.wdfiles.com/local--files/quantum-turbulence/NPNfj.jpg|static/img/quantum-turbulence/NPNfj.jpg"
  "https://abag.wdfiles.com/local--files/quantum-turbulence/cascade.png|static/img/quantum-turbulence/cascade.png"
  "https://abag.wdfiles.com/local--files/quantum-turbulence/smooth.png|static/img/quantum-turbulence/smooth.png"
  "https://abag.wdfiles.com/local--files/quantum-turbulence/CF_tangle.png|static/img/quantum-turbulence/CF_tangle.png"
  "https://abag.wdfiles.com/local--files/quantum-turbulence/quasi.png|static/img/quantum-turbulence/quasi.png"
  "https://abag.wdfiles.com/local--files/teaching/MAS2803_1920.pdf|static/files/teaching/MAS2803_1920.pdf"
  "https://abag.wdfiles.com/local--files/teaching/main3801.pdf|static/files/teaching/main3801.pdf"
  "https://abag.wdfiles.com/local--files/teaching/MAS8854.pdf|static/files/teaching/MAS8854.pdf"
  "https://abag.wdfiles.com/local--files/teaching/MAS3111.pdf|static/files/teaching/MAS3111.pdf"
)

if [[ "${1:-}" == "--check" ]]; then
  missing=0
  for entry in "${FILES[@]}"; do
    dest="${entry##*|}"
    if [[ ! -s "$dest" ]]; then echo "  missing  $dest"; missing=$((missing+1)); fi
  done
  echo "$missing of ${#FILES[@]} files missing."
  exit $(( missing > 0 ))
fi

ok=0; skipped=0; failed=()
for entry in "${FILES[@]}"; do
  url="${entry%%|*}"; dest="${entry##*|}"
  if [[ -s "$dest" ]]; then skipped=$((skipped+1)); continue; fi
  mkdir -p "$(dirname "$dest")"
  if curl -fsSL --retry 3 --max-time 120 -o "$dest.part" "$url"; then
    mv "$dest.part" "$dest"; ok=$((ok+1)); echo "  got  $dest"
  else
    rm -f "$dest.part"; failed+=("$url"); echo "  FAIL $url"
  fi
done

echo
echo "Downloaded $ok, skipped $skipped (already present), failed ${#failed[@]} of ${#FILES[@]}."
if (( ${#failed[@]} )); then
  echo "Failed URLs (download these by hand into the matching folder under static/):"
  printf '  %s\n' "${failed[@]}"
  exit 1
fi
