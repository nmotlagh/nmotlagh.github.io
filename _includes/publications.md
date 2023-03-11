## Publications
Here are some of my recent publications:
<br/>

#### [Learning When to Say "I Don't Know"](https://arxiv.org/abs/2209.04944)
N. Kashani Motlagh, J. Davis, T. Anderson, and J. Gwinnup\
*International Symposium on Visual Computing*, October 2022.\
**[Best Paper Award]**

Abstract: We propose a new Reject Option Classification technique to identify and remove regions of uncertainty in the decision space for a given neural classifier and dataset. Such existing formulations employ a learned rejection (remove)/selection (keep) function and require either a known cost for rejecting examples or strong constraints on the accuracy or coverage of the selected examples. We consider an alternative formulation by instead analyzing the complementary reject region and employing a validation set to learn per-class softmax thresholds. The goal is to maximize the accuracy of the selected examples subject to a natural randomness allowance on the rejected examples (rejecting more incorrect than correct predictions). We provide results showing the benefits of the proposed method over naïvely thresholding calibrated/uncalibrated softmax scores with 2-D points, imagery, and text classification datasets using state-of-the-art pretrained models. Source code is available at [this https URL](https://github.com/osu-cvl/learning-idk).

<br/>

#### [A Framework for Semi-automatic Collection of Temporal Satellite Imagery for Analysis of Dynamic Regions](https://openaccess.thecvf.com/content/ICCV2021W/LUAI/papers/Motlagh_A_Framework_for_Semi-Automatic_Collection_of_Temporal_Satellite_Imagery_for_ICCVW_2021_paper.pdf)
N. Kashani Motlagh, A. Radhakrishnan, J. Davis, and R. Ilin\
*Learning to Understand Aerial Images* (ICCV Workshop), October 2021.

Abstract: Analyzing natural and anthropogenic activities using re-mote sensing data has become a problem of increasing interest. However, this generally involves tediously labeling extensive imagery, perhaps on a global scale. The lack of a streamlined method to collect and label imagery over time makes it challenging to tackle these problems using popular, supervised deep learning approaches. We address this need by presenting a framework to semi-automatically collect and label dynamic regions in satellite imagery using crowd-sourced OpenStreetMap data and available satellite imagery resources. The generated labels can be quickly verified to ease the burden of full manual labeling. We leverage this framework for the ability to gather image sequences of areas that have label reclassification over time. One possible application of our framework is demonstrated to collect and classify construction vs. non-construction sites. Overall, the proposed framework can be adapted for similar change detection or classification tasks in various remote sensing applications.