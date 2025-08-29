import numpy as np
from scipy.optimize import differential_evolution

def find_maximum_accuracy_linear_separator(data):
    """
    Find the linear decision boundary that maximizes classification accuracy.
    This approach focuses purely on maximizing TP + TN, ignoring margin.
    Uses global optimization for the non-convex accuracy landscape.
    
    Parameters:
    -----------
    data : variable arguments
        Each argument should be a tuple/list of (x, y, label)
        where x, y are coordinates and label is the class
    
    Returns:
    --------
    dict containing:
    - 'weights': [w1, w2] coefficients of decision boundary
    - 'bias': bias term b
    - 'equation': decision boundary equation
    - 'accuracy': classification accuracy (TP + TN) / total
    - 'confusion_matrix': [TP, FP, TN, FN] counts
    - 'decision_function': function to classify new points
    """
    # Extract points and labels from data
    points = np.array([[p[0], p[1]] for p in data], dtype=float)
    labels = np.array([1 if p[2] == "Pass" else 0 for p in data], dtype=int)
    
    # Input validation
    unique_labels = np.unique(labels)
    if len(unique_labels) != 2:
        raise ValueError("Data must have exactly 2 classes")
    
    # Convert to -1, +1 format
    if not np.array_equal(np.sort(unique_labels), np.array([-1, 1])):
        label_map = {unique_labels[0]: -1, unique_labels[1]: 1}
        labels = np.array([label_map[label] for label in labels])

    def compute_accuracy_and_confusion(weights, bias):
        """Compute accuracy and confusion matrix"""
        decision_values = np.dot(points, weights) + bias
        predictions = np.sign(decision_values)
        predictions[predictions == 0] = 1  # Handle zeros
        
        # Confusion matrix
        tp = np.sum((predictions == 1) & (labels == 1))  # True Positives
        tn = np.sum((predictions == -1) & (labels == -1))  # True Negatives
        fp = np.sum((predictions == 1) & (labels == -1))  # False Positives
        fn = np.sum((predictions == -1) & (labels == 1))  # False Negatives
        
        accuracy = (tp + tn) / len(labels)
        return accuracy, [tp, fp, tn, fn]

    def objective_function(params):
        """Minimize negative accuracy to maximize accuracy"""
        weights = params[:2]
        bias = params[2]
        
        if np.linalg.norm(weights) < 1e-10:
            return 1.0  # Worst accuracy
        
        decision_values = np.dot(points, weights) + bias
        predictions = np.sign(decision_values)
        predictions[predictions == 0] = 1
        
        # Calculate accuracy
        correct = np.sum(predictions == labels)
        accuracy = correct / len(labels)
        return -accuracy  # Minimize negative = maximize positive

    # Global optimization using differential evolution
    # This handles the non-convex, discrete nature of accuracy maximization
    bounds = [(-10, 10), (-10, 10), (-100, 100)]  # [w1, w2, b]
    result = differential_evolution(
        objective_function, bounds, maxiter=1000, popsize=30, seed=42, atol=1e-8
    )

    if result.success:
        weights = result.x[:2]
        bias = result.x[2]
        accuracy, confusion = compute_accuracy_and_confusion(weights, bias)

        def decision_function(x):
            x = np.array(x)
            if x.ndim == 1:
                return float(np.dot(x, weights) + bias)
            else:
                return np.dot(x, weights) + bias

        return {
            "weights": weights,
            "bias": bias,
            "equation": f"{weights[0]:.6f}*x + {weights[1]:.6f}*y + {bias:.6f} = 0",
            "method": "Global Optimization (Maximum Accuracy)",
            "accuracy": accuracy,
            "confusion_matrix": confusion,  # [TP, FP, TN, FN]
            "decision_function": decision_function,
        }
    else:
        raise RuntimeError("Optimization failed")

# # Usage Example
# points = np.array(
#     [
#         [100, 150],
#         [120, 180],
#         [200, 250],  # Class 0
#         [300, 350],
#         [320, 380],
#         [400, 450],  # Class 1
#     ]
# )
# labels = np.array([0, 0, 0, 1, 1, 1])

# result = find_maximum_accuracy_linear_separator(points, labels)
# print(f"Maximum Accuracy: {result['accuracy']:.3f} ({result['accuracy'] * 100:.1f}%)")
# print(f"Decision Boundary: {result['equation']}")
# print(f"Confusion Matrix [TP, FP, TN, FN]: {result['confusion_matrix']}")

# # Classify new point
# new_point = [250, 300]
# prediction = 1 if result["decision_function"](new_point) > 0 else 0
# print(f"Point {new_point} -> Class {prediction}")

import numpy as np

def best_linear_classifier(X, y, angles=721, offsets=1001):
    """
    Finds the linear decision boundary that maximizes training accuracy
    by scanning angles and offsets.

    Parameters:
        X: np.ndarray of shape (n_samples, 2)
        y: np.ndarray of shape (n_samples,) with labels in {0, 1}
        angles: number of angles to scan between 0 and π
        offsets: number of thresholds per angle

    Returns:
        dict with keys:
            - weights: [w0, w1]
            - bias: scalar
            - fit: function(X_new) -> np.ndarray of predictions in {0, 1}
            - accuracy: training accuracy
    """
    # Convert labels to {-1, +1}
    ypm = np.where(y == 0, -1, 1)

    # Center data (so bias comes from offset later)
    Xc = X - X.mean(axis=0, keepdims=True)

    best_acc = -1
    best_w = None
    best_b = None

    thetas = np.linspace(0, np.pi, angles)  # angle for normal vector

    for th in thetas:
        n_vec = np.array([np.cos(th), np.sin(th)])  # normal direction
        projs = Xc @ n_vec
        tmin, tmax = projs.min(), projs.max()
        ts = np.linspace(tmin, tmax, offsets)

        for t in ts:
            side = np.sign(projs - t)
            side[side == 0] = 1
            acc = (side == ypm).mean()

            if acc > best_acc:
                best_acc = acc
                # w·x + b = 0 → w = n_vec, b = -t - n_vec·mean
                w = n_vec
                b = -(t + n_vec @ X.mean(axis=0))
                best_w = w
                best_b = b

    def predict(X_new):
        return (X_new @ best_w + best_b >= 0).astype(int)

    return {
        "weights": best_w.tolist(),
        "bias": float(best_b),
        "decision_function": predict,
        "accuracy": best_acc
    }

# Example usage
# X = np.random.randn(100, 2)
# y = (X[:, 0] + X[:, 1] > 0).astype(int)
# clf = best_linear_classifier(X, y)
# print(clf["weights"], clf["bias"], clf["accuracy"])
# y_pred = clf["fit"](X)
