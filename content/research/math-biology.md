---
title: Mathematical biology
short: Maths biology
weight: 2
theme: bio
image: img/math-biology/Tree_snap.png
summary: >-
  How tree and plant diseases spread through landscapes, and how to fit stochastic epidemic models to sparse
  survey data, alongside collective animal motion, stem cell colonies and the spread of farming in
  Neolithic Europe.
keywords: plant health, stochastic epidemic models, Bayesian inference, early-warning signals, diffusion models, oak processionary moth, flocking, Neolithic dispersal
---

The biological world provides many lifetimes of interesting phenomena, so it is no surprise that mathematical biology is an active, diverse and important field; my interests span several parts of it. I am interested in the interaction between fluid motion and microbial or animal behaviour, including gyrotactic organisms in complex flows, and how underlying fluid motion can help us understand collective motion such as bird flocks.

More recently I have become involved in a number of projects to understand the spread of tree disease in UK forests. This is particularly motivating, as a series of silent pandemics in tree and plant species poses a massive threat to humanity and our current way of life. Mathematical modelling can provide insight into how to plan, how to react, and how to inform policymakers. Current work combines stochastic epidemic models with statistical and machine-learning inference, from tracking the oak processionary moth across the UK to learning spatial transmission maps from sparse outbreak snapshots with generative diffusion models. The diffusion model animation on the [home page](/) sketches how the second of these works.

Finally, I am interested in understanding the spread of farming in the Neolithic using mathematical modelling. Contributions I believe are important to the field are highlighted below.

## Research highlights

{{< finding img="img/math-biology/Tree_snap.png" alt="Simulated forest showing healthy, infected and removed trees during an outbreak" title="Early warning signals in tree disease" >}}
Native trees are under constant threat from alien pests and diseases, as exemplified by recent outbreaks affecting ash and sweet chestnut. Such outbreaks have massive social and economic impacts and motivate the need for suitable planning and management. Climate change exacerbates the threat by promoting the migration, survival and growth of alien pathogens, and the Department for Environment, Food and Rural Affairs (Defra) has highlighted the importance of modelling in developing robust plans and policies to minimise their impact.

In a [recent paper](/papers/tree_disease_lattice.pdf) we used the framework of early-warning indicators for impending regime shifts, widely applied to dynamical systems, to study the transition from confinement of a forest disease to a catastrophic outbreak. Our study shows that early-warning indicators can predict forest disease epidemics, and may also help to identify a planting density that slows the spread of disease. The tree disease animation on the [home page](/) is a simple version of this model.
{{< /finding >}}

{{< finding img="img/math-biology/Sirio_snap.png" alt="Simulated human embryonic stem cell colony" title="Stem cell colonies" >}}
Stem cells are at the forefront of modern biological research. Human embryonic stem cells (hESCs) are pluripotent: they can differentiate into all tissues of the body, and it is hoped that stem-cell therapies may one day treat life-changing illnesses. In lab-grown colonies, maintaining undifferentiated cells is critical for regenerative medicine, drug testing and fundamental biology. At present the best cells and colonies are usually selected by eye, relying on expertise to identify features such as a tightly packed appearance and a well-defined edge. In a [recent study](/papers/Sirio_stem_cell1.pdf) we developed a methodology using image analysis and computational modelling to quantify these properties. The findings help explain the biological processes behind high-quality hESC colonies and establish a database of colony characteristics to guide future studies.
{{< /finding >}}

{{< finding img="img/math-biology/spinflock.png" alt="Model flock moving through a vortical flow" title="Anticipation in flocks" >}}
Collective animal motion produces some of the most spectacular displays the natural world has to offer, from rotating ant colonies and starling murmurations to wildebeest stampeding across the savannah. One of the most widely used models of flocking is the Vicsek model, an agent-based approach in which each organism is a point that aligns with its neighbours. Flocking in this model is robust to noise that is uncorrelated in space and time, but a [study by Khurana and Ouellette](https://iopscience.iop.org/article/10.1088/1367-2630/15/9/095015) showed that spatiotemporally correlated noise strongly affects whether Vicsek flocks can form. Schools of fish and flocks of birds clearly form in turbulent environments, so the alignment mechanism deserves another look.

In a [paper published in 2016](https://doi.org/10.1103/PhysRevE.93.063109), I showed that combining alignment with local neighbours and anticipation of their motion allows flocks to persist in vortical fluid flow. The primary motivation is understanding the interactions within animal groups, but there may also be applications to the design of flocking autonomous drones and artificial microswimmers.
{{< /finding >}}

{{< finding img="img/math-biology/Neo_snap.png" alt="Map of the spread of Neolithic farming across Europe" title="Neolithic riverways" >}}
The transition to the Neolithic was a crucial period in the development of Eurasian societies, defining much of their subsequent evolution. The introduction of agro-pastoral farming, which originated in the Near East around 12,000 years ago and then spread throughout Europe, is a defining feature of this transition. In a [series of papers](/papers/henderson_antiquity.pdf) we developed a mathematical and statistical framework to understand the role of waterways in the spread of farming into western Europe. Our results confirmed several conclusions of earlier studies: an accelerated spread along the western Mediterranean coast, a modest acceleration in the eastern Mediterranean, and enhanced spread in the Danube–Rhine corridor. These findings help build a global picture of the emergence of farming across Europe.
{{< /finding >}}
