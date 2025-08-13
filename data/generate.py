import numpy as np
import matplotlib.pyplot as plt
from matplotlib.widgets import Slider
from sklearn.linear_model import LogisticRegression
import random
import sys
import argparse
import json

# ----- Defaults -----
default_params = {
    "meanX": 250,
    "stdX": 80,
    "meanY": 250,
    "stdY": 80,
    "outlier_ratio": 0.05,
    "pass_threshold": 300,
    "seed": 42,
}

# ----- CLI Parsing -----
parser = argparse.ArgumentParser()
parser.add_argument("--samples", type=int, required=True)
parser.add_argument("--meanX", type=float)
parser.add_argument("--meanY", type=float)
parser.add_argument("--stdX", type=float)
parser.add_argument("--stdY", type=float)
parser.add_argument("--outlierRatio", type=float)
parser.add_argument("--passThreshold", type=float)
parser.add_argument("--saveFile", type=str)
parser.add_argument("--plot", action="store_true")
parser.add_argument("--testSamples", type=int, default=0)
parser.add_argument("--seed", type=int)  # Added seed CLI argument
args = parser.parse_args()

# Override defaults with CLI args
params = default_params.copy()
if args.meanX is not None:
    params["meanX"] = args.meanX
if args.meanY is not None:
    params["meanY"] = args.meanY
if args.stdX is not None:
    params["stdX"] = args.stdX
if args.stdY is not None:
    params["stdY"] = args.stdY
if args.outlierRatio is not None:
    params["outlier_ratio"] = args.outlierRatio
if args.passThreshold is not None:
    params["pass_threshold"] = args.passThreshold
if args.seed is not None:  # Apply seed override
    params["seed"] = args.seed


# ----- Utils -----
def sigmoid(x):
    return 1 / (1 + np.exp(-x))


def generate_points(
    num_samples, meanX, stdX, meanY, stdY, outlier_ratio, pass_threshold, seed
):
    random.seed(seed)
    np.random.seed(seed)
    points = []
    num_outliers = int(outlier_ratio * num_samples)
    for i in range(num_samples):
        if i < num_outliers:
            study_time = random.uniform(0, 500)
            screen_time = random.uniform(0, 500)
        else:
            study_time = np.clip(np.random.normal(meanX, stdX), 0, 500)
            screen_time = np.clip(np.random.normal(meanY, stdY), 0, 500)
        score = study_time - screen_time
        pass_prob = sigmoid((score - (pass_threshold - 250)) / 40)
        point_type = "a" if random.random() < pass_prob else "b"
        points.append((study_time, screen_time, point_type))
    return points


def fit_classifier(points):
    X = np.array([[p[0], p[1]] for p in points])
    y = np.array([1 if p[2] == "a" else 0 for p in points])
    clf = LogisticRegression()
    clf.fit(X, y)
    acc = clf.score(X, y)
    return clf, acc


def get_boundary_segment(clf):
    # Decision boundary: coef[0]*x + coef[1]*y + intercept = 0
    w = clf.coef_[0]
    b = clf.intercept_[0]
    seg_points = []
    # Intersect with box edges
    edges = [
        ((0, 0), (500, 0)),
        ((500, 0), (500, 500)),
        ((500, 500), (0, 500)),
        ((0, 500), (0, 0)),
    ]
    for (x1, y1), (x2, y2) in edges:
        if x1 == x2:  # vertical
            x = x1
            if w[1] != 0:
                y = -(w[0] * x + b) / w[1]
                if 0 <= y <= 500:
                    seg_points.append((x, y))
        else:  # horizontal
            y = y1
            if w[0] != 0:
                x = -(w[1] * y + b) / w[0]
                if 0 <= x <= 500:
                    seg_points.append((x, y))
    # Return at most 2 points
    return seg_points[:2]


def classify_origin(clf):
    return clf.predict([[0, 0]])[0] == 1


# ----- Main -----
points = generate_points(args.samples, **params)
if args.testSamples > 0:
    test_points = generate_points(
        args.testSamples,
        **{**params, "seed": params["seed"] + 1},
    )
else:
    test_points = None
clf, acc = fit_classifier(points)
boundary_segment = get_boundary_segment(clf)
origin_pass = bool(classify_origin(clf))

# Prepare save object
save_obj = {
    "data": [
        {
            "study_time": p[0],
            "screen_time": p[1],
            "type": "Pass" if p[2] == "a" else "Fail",
        }
        for p in points
    ],
    "best": [{"x": x, "y": y} for (x, y) in boundary_segment],
    "originIsPass": origin_pass,
}
if test_points:
    save_obj["testData"] = [
        {
            "study_time": p[0],
            "screen_time": p[1],
            "type": "Pass" if p[2] == "a" else "Fail",
        }
        for p in test_points
    ]

# Non-plot mode
if not args.plot:
    if args.saveFile:
        with open(args.saveFile, "w") as f:
            json.dump(save_obj, f, indent=2)
    print(json.dumps(save_obj, indent=2))
    sys.exit(0)

# ----- Plot mode -----
fig, ax = plt.subplots(figsize=(6, 6))
plt.subplots_adjust(left=0.1, bottom=0.35)
scatter = ax.scatter(
    [p[0] for p in points],
    [p[1] for p in points],
    c=["green" if p[2] == "a" else "red" for p in points],
)
x_vals = np.linspace(0, 500, 100)
y_vals = np.linspace(0, 500, 100)
XX, YY = np.meshgrid(x_vals, y_vals)
Z = clf.predict(np.c_[XX.ravel(), YY.ravel()]).reshape(XX.shape)
ax.contour(XX, YY, Z, levels=[0.5], linewidths=2, colors="blue")
ax.set_xlim(0, 500)
ax.set_ylim(0, 500)
ax.set_title(f"Sample Size: {args.samples} | Accuracy: {acc:.2f}")

# Sliders
axcolor = "lightgoldenrodyellow"
slider_axes = {
    "meanX": plt.axes([0.1, 0.25, 0.65, 0.03], facecolor=axcolor),
    "stdX": plt.axes([0.1, 0.2, 0.65, 0.03], facecolor=axcolor),
    "meanY": plt.axes([0.1, 0.15, 0.65, 0.03], facecolor=axcolor),
    "stdY": plt.axes([0.1, 0.1, 0.65, 0.03], facecolor=axcolor),
    "outlier_ratio": plt.axes([0.1, 0.05, 0.65, 0.03], facecolor=axcolor),
    "pass_threshold": plt.axes([0.1, 0.0, 0.65, 0.03], facecolor=axcolor),
}
sliders = {
    "meanX": Slider(
        slider_axes["meanX"], "Mean Study", 0, 500, valinit=params["meanX"]
    ),
    "stdX": Slider(slider_axes["stdX"], "Std Study", 1, 200, valinit=params["stdX"]),
    "meanY": Slider(
        slider_axes["meanY"], "Mean Screen", 0, 500, valinit=params["meanY"]
    ),
    "stdY": Slider(slider_axes["stdY"], "Std Screen", 1, 200, valinit=params["stdY"]),
    "outlier_ratio": Slider(
        slider_axes["outlier_ratio"],
        "Outliers",
        0,
        0.5,
        valinit=params["outlier_ratio"],
    ),
    "pass_threshold": Slider(
        slider_axes["pass_threshold"],
        "Pass Thresh",
        0,
        500,
        valinit=params["pass_threshold"],
    ),
}


def update(val):
    new_params = {
        "meanX": sliders["meanX"].val,
        "stdX": sliders["stdX"].val,
        "meanY": sliders["meanY"].val,
        "stdY": sliders["stdY"].val,
        "outlier_ratio": sliders["outlier_ratio"].val,
        "pass_threshold": sliders["pass_threshold"].val,
        "seed": params["seed"],
    }
    new_points = generate_points(args.samples, **new_params)
    new_clf, new_acc = fit_classifier(new_points)
    ax.clear()
    ax.set_xlim(0, 500)
    ax.set_ylim(0, 500)
    ax.scatter(
        [p[0] for p in new_points],
        [p[1] for p in new_points],
        c=["green" if p[2] == "a" else "red" for p in new_points],
    )
    XX, YY = np.meshgrid(x_vals, y_vals)
    Z = new_clf.predict(np.c_[XX.ravel(), YY.ravel()]).reshape(XX.shape)
    ax.contour(XX, YY, Z, levels=[0.5], linewidths=2, colors="blue")
    ax.set_title(f"Sample Size: {args.samples} | Accuracy: {new_acc:.2f}")
    fig.canvas.draw_idle()


for s in sliders.values():
    s.on_changed(update)


def on_close(event):
    # Final params from sliders
    final_params = {
        "meanX": sliders["meanX"].val,
        "stdX": sliders["stdX"].val,
        "meanY": sliders["meanY"].val,
        "stdY": sliders["stdY"].val,
        "outlier_ratio": sliders["outlier_ratio"].val,
        "pass_threshold": sliders["pass_threshold"].val,
        "seed": params["seed"],
    }
    final_points = generate_points(args.samples, **final_params)
    final_clf, _ = fit_classifier(final_points)
    final_segment = get_boundary_segment(final_clf)
    final_origin = bool(classify_origin(final_clf))
    final_obj = {
        "data": [
            {
                "study_time": p[0],
                "screen_time": p[1],
                "type": "Pass" if p[2] == "a" else "Fail",
            }
            for p in final_points
        ],
        "best": [{"x": x, "y": y} for (x, y) in final_segment],
        "originIsPass": final_origin,
    }
    if args.testSamples > 0:
        test_params = final_params.copy()
        test_params["seed"] = final_params["seed"] + 1
        test_points = generate_points(args.testSamples, **test_params)
        final_obj["testData"] = [
            {
                "study_time": p[0],
                "screen_time": p[1],
                "type": "Pass" if p[2] == "a" else "Fail",
            }
            for p in test_points
        ]
    if args.saveFile:
        with open(args.saveFile, "w") as f:
            json.dump(final_obj, f, indent=2)
    print(json.dumps(final_obj, indent=2))
    sys.exit(0)


fig.canvas.mpl_connect("close_event", on_close)
plt.show()
