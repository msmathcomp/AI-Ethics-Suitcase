import numpy as np
import matplotlib.pyplot as plt
from matplotlib.widgets import Slider
from sklearn.linear_model import LogisticRegression
from sklearn import svm
import random
import sys
import argparse
import json

from classify import find_maximum_accuracy_linear_separator, best_linear_classifier
# from classify2 import best_linear_classifier_bruteforce

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
            point_type = "Pass" if random.random() < 0.5 else "Fail"
            points.append((study_time, screen_time, point_type))
            continue
        else:
            study_time = np.clip(np.random.normal(meanX, stdX), 0, 500)
            screen_time = np.clip(np.random.normal(meanY, stdY), 0, 500)
        score = study_time - screen_time
        pass_prob = sigmoid((score - (pass_threshold - 250)) / 40)
        point_type = "Pass" if random.random() < pass_prob else "Fail"
        points.append((study_time, screen_time, point_type))
    return points

def equality(a, b):
    return abs(a - b) < 1e-6  # Use a small epsilon for floating point comparison

def find_best_fit(points):
    boundary = []
    for i in np.arange(0, 501, 10):
        for j in np.arange(0, 501, 10):
            if equality(i, 0) or equality(j, 0) or equality(i, 500) or equality(j, 500):
                boundary.append((i, j))

    best = [0]

    print(len(boundary), "boundary points")
    
    for (x1, y1) in boundary:
        for (x2, y2) in boundary:
            if equality(x1, x2) or equality(y1, y2):
                continue
            
            for originIsPass in [True, False]:
                m = (y2 - y1) / (x2 - x1)
                c = y1 - m * x1

                correct = 0

                for (study_time, screen_time, point_type) in points:
                    # check if the points is on the same side as the origin
                    # and check if the point is correctly classified
                    sameSideOrigin = (m * 0 + c) * (m * study_time + c) >= 0
                    if sameSideOrigin == originIsPass:
                        if point_type == "Pass": correct += 1
                    else :
                        if point_type == "Fail": correct += 1

                accuracy = correct / len(points)
                if accuracy > best[0]:
                    best = [accuracy, (x1, y1), (x2, y2), originIsPass, m, c]
    return best



def fit_classifier(points):
    X = np.array([[p[0], p[1]] for p in points])
    y = np.array([1 if p[2] == "Pass" else 0 for p in points])
    # clf = LogisticRegression(solver="liblinear", max_iter=10000)
    clf = svm.SVC(kernel='linear', C=1.0)
    clf.fit(X, y)
    acc = clf.score(X, y)
    return clf, acc
    # print(points)
    # res = find_maximum_accuracy_linear_separator(points)
    # return res
    

def fit_classifier_2(points):
    X = np.array([[p[0], p[1]] for p in points])
    y = np.array([1 if p[2] == "Pass" else 0 for p in points])

    clf = best_linear_classifier(X, y)
    return clf

# def fit_classifier_3(points):
#     X = np.array([[p[0], p[1]] for p in points])
#     y = np.array([1 if p[2] == "Pass" else 0 for p in points])
#     clf = best_linear_classifier_bruteforce(X, y)
#     return clf

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
    "data": [{"study_time": p[0], "screen_time": p[1], "type": p[2]} for p in points],
    "best": [{"x": x, "y": y} for (x, y) in boundary_segment],
    "originIsPass": origin_pass,
}
if test_points:
    save_obj["testData"] = [
        {
            "study_time": p[0],
            "screen_time": p[1],
            "type": p[2],
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
    c=["green" if p[2] == "Pass" else "red" for p in points],
)
x_vals = np.linspace(0, 500, 100)
y_vals = np.linspace(0, 500, 100)
XX, YY = np.meshgrid(x_vals, y_vals)
Z = clf.predict(np.c_[XX.ravel(), YY.ravel()]).reshape(XX.shape)
ax.contour(XX, YY, Z, levels=[0.5], linewidths=2, colors="blue")
# best = find_best_fit(points)
# # show the line y = best[4] * x + best[5]
# x_line = np.array([0, 500])
# y_line = best[4] * x_line + best[5]
# ax.plot(x_line, y_line, color="blue", linewidth=2)
ax.set_xlim(0, 500)
ax.set_ylim(0, 500)
ax.set_title(f"Sample Size: {args.samples} | Accuracy: {acc:.2f}")

# Sliders
axcolor = "lightgoldenrodyellow"
slider_axes = {
    "meanX": plt.axes([0.1, 0.3, 0.65, 0.03], facecolor=axcolor),
    "stdX": plt.axes([0.1, 0.25, 0.65, 0.03], facecolor=axcolor),
    "meanY": plt.axes([0.1, 0.20, 0.65, 0.03], facecolor=axcolor),
    "stdY": plt.axes([0.1, 0.15, 0.65, 0.03], facecolor=axcolor),
    "outlier_ratio": plt.axes([0.1, 0.1, 0.65, 0.03], facecolor=axcolor),
    "pass_threshold": plt.axes([0.1, 0.05, 0.65, 0.03], facecolor=axcolor),
    "seed": plt.axes([0.1, 0, 0.65, 0.03], facecolor=axcolor),
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
    "seed": Slider(
        slider_axes["seed"],
        "Seed",
        0,
        100,
        valinit=params["seed"],
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
        "seed": int(sliders["seed"].val),
    }
    new_points = generate_points(args.samples, **new_params)
    if not any(p[2] == "Pass" for p in new_points) or not any(
        p[2] == "Fail" for p in new_points
    ):
        return
    new_clf, acc = fit_classifier(new_points)
    ax.clear()
    ax.set_xlim(0, 500)
    ax.set_ylim(0, 500)
    ax.scatter(
        [p[0] for p in new_points],
        [p[1] for p in new_points],
        c=["green" if p[2] == "Pass" else "red" for p in new_points],
    )
    XX, YY = np.meshgrid(x_vals, y_vals)
    Z = new_clf.predict(np.c_[XX.ravel(), YY.ravel()]).reshape(XX.shape)
    ax.contour(XX, YY, Z, levels=[0.5], linewidths=2, colors="blue")

    # best = find_best_fit(new_points)
    # x_line = np.array([0, 500])
    # y_line = best[4] * x_line + best[5]
    # ax.plot(x_line, y_line, color="blue", linewidth=2)

    ax.set_title(f"Sample Size: {args.samples} | Accuracy: {acc:.2f}")
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
        "seed": int(sliders["seed"].val),
    }
    final_points = generate_points(args.samples, **final_params)
    final_clf, acc = fit_classifier(final_points)
    final_segment = get_boundary_segment(final_clf)
    final_origin = bool(classify_origin(final_clf))
    final_obj = {
        "data": [
            {
                "study_time": p[0],
                "screen_time": p[1],
                "type": p[2],
            }
            for p in final_points
        ],
        "best": [{"x": x, "y": y} for (x, y) in final_segment],
        "originIsPass": final_origin,
        "params": final_params,
    }
    if args.testSamples > 0:
        test_params = final_params.copy()
        test_params["seed"] = final_params["seed"] + 1
        test_points = generate_points(args.testSamples, **test_params)
        final_obj["testData"] = [
            {"study_time": p[0], "screen_time": p[1], "type": p[2]} for p in test_points
        ]
    if args.saveFile:
        with open(args.saveFile, "w") as f:
            json.dump(final_obj, f, indent=2)
    print(json.dumps(final_obj, indent=2))
    print(acc)
    sys.exit(0)


fig.canvas.mpl_connect("close_event", on_close)
plt.show()
