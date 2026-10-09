---
title: Quantum fluids and turbulence
short: Quantum fluids
weight: 1
theme: qf
image: img/quantum-turbulence/cascade.png
summary: >-
  Turbulence in superfluid helium and atomic Bose–Einstein condensates: vortex reconnections, Kelvin-wave
  cascades, coherent vortex bundles and the motion of point vortices in two dimensions, studied with
  vortex filament and Gross–Pitaevskii simulations.
keywords: vortex filament method, Gross–Pitaevskii equation, Kelvin waves, vortex reconnections, thermal counterflow, point vortices, dipolar condensates, neutron stars
---

{{< finding img="img/quantum-turbulence/NPNfj.jpg" alt="Density of a rotating Bose–Einstein condensate, with quantised vortices visible as small dark dimples" >}}
The term quantum turbulence denotes the turbulent motion of quantum fluids, such as superfluid helium and atomic Bose–Einstein condensates (BECs). Quantum fluids differ from ordinary fluids in three respects: (1) they exhibit two-fluid behaviour at nonzero temperatures, (2) they can flow freely, without the dissipative effect of viscous forces, and (3) their local rotation is constrained to discrete vortex lines of known size and strength. These quantised vortices can be seen in the image, which shows the density of a rotating BEC: dark areas denote low density and the small black dimples are vortices. This is in contrast to the eddies in ordinary (classical) fluids, which are continuous and can have arbitrary size, shape and strength.

Recent experiments and numerical simulations have highlighted quantitative connections, as well as fundamental differences, between turbulence in quantum fluids and turbulence in ordinary fluids. I primarily perform high-resolution numerical simulations using either the vortex filament method or the Gross–Pitaevskii equation. A good introduction to the field is the [PNAS special feature on quantum turbulence](http://www.pnas.org/cgi/collection/quantum).
{{< /finding >}}

More recently my group has worked on vortex reconnections compared directly with experiment, the statistics of point vortices in two-dimensional quantum gases, dipolar (quantum ferrofluid) condensates, and the collective motion of vortices in neutron stars. See the [publications](/publications/) for details.

## Research highlights

{{< finding img="img/quantum-turbulence/cascade.png" alt="Kelvin waves cascading to small scales along a quantised vortex filament" title="Kelvin-wave cascade" >}}
There are similarities between quantum and classical turbulence, but at small scales they cease. In classical turbulence energy is dissipated by viscosity, yet zero-temperature superfluid turbulence has no viscosity, so how is energy dissipated? The Kelvin-wave cascade has been proposed to explain this.

A Kelvin wave is a rotating sinusoidal or helical displacement of a vortex core away from its unperturbed position. Kelvin waves can be triggered in several ways, but vortex reconnection is probably the dominant mechanism. In the Kelvin-wave cascade, nonlinear interactions between Kelvin waves create waves of shorter and shorter wavelength. At high temperatures mutual friction quickly damps the shorter waves, but at low temperatures the cascade proceeds unhindered until the wavenumber is large enough that sound is efficiently radiated away (phonon emission) by rapidly rotating vortices.

Rival theories of the cascade were proposed. In 2014 Jason Laurie and I provided [numerical evidence](https://doi.org/10.1103/PhysRevB.89.014504) that weakly nonlinear Kelvin-wave interactions are governed by the nonlocal wave turbulence theory of L'vov and Nazarenko.
{{< /finding >}}

{{< finding img="img/quantum-turbulence/smooth.png" alt="Vortex tangle with coherent bundles of quantised vortices highlighted" title="Coherent structures" >}}
Using a numerical model of quantum turbulence, [we showed](https://doi.org/10.1103/PhysRevLett.109.205304) that the total vortex line density can be decomposed into two parts: one formed by metastable bundles of coherent vortices, and one in which the vortices are randomly oriented. The former is responsible for the observed Kolmogorov energy spectrum, and the latter for the spectrum of the vortex line density fluctuations. These results help to explain puzzling measurements of the vortex line density in a superfluid wind tunnel made by Philippe Roche and collaborators.
{{< /finding >}}

{{< finding img="img/quantum-turbulence/CF_tangle.png" alt="Vortex tangle in thermal counterflow turbulence" title="Acceleration statistics" >}}
[We numerically determined](https://doi.org/10.1103/PhysRevE.89.033006) the one-point superfluid acceleration statistics in counterflow turbulence and showed how the mean velocity and acceleration scale with counterflow velocity and temperature.

Counterflow turbulence is the original, and perhaps easiest, way to observe quantum turbulence in the laboratory. A prototypical experiment consists of a channel closed at one end and open to the helium bath at the other. At the closed end, a resistor inputs a steady flux of heat. The heat is carried towards the bath by the normal fluid, while the superfluid flows towards the resistor to keep the total mass flux zero. If the relative velocity of the two fluids exceeds a small critical value, the laminar counterflow breaks down and a tangle of vortex lines appears, limiting the heat-conducting properties of helium-4.

We also showed that the probability density function of the one-point acceleration should follow a power law with a −5/3 exponent. Earlier experimental and numerical studies had shown that one-point velocity statistics also follow a power law, because of the singular velocity field induced by a quantised vortex. Our numerical results support these arguments and agree well with experimental results from the Prague group.
{{< /finding >}}

{{< finding img="img/quantum-turbulence/quasi.png" alt="Simulated Andreev reflection of quasiparticles by a vortex tangle" title="Visualising pure quantum turbulence in superfluid ³He" >}}
Superfluid ³He-B in the zero-temperature limit offers a unique way of studying quantum turbulence, through the Andreev reflection of quasiparticle excitations by the flow fields of vortices. We validated the experimental visualisation of turbulence in ³He-B by showing the relation between the vortex line density and the Andreev reflectance of the tangle, in the first simulations of Andreev reflection by a realistic three-dimensional vortex tangle. A previous study argued that fluctuations of the Andreev-reflected signal can be interpreted as fluctuations of the vortex line density; our combined numerical and experimental results showed that the two are indeed correlated.
{{< /finding >}}
