# Predicting Electric Vehicle Purchases

Kaggle Playground Series, Season 6, Episode 9. This is a binary classification problem: predict the **probability** that a person will buy an electric vehicle (`Will_Buy_EV`) from demographic, location, and charging-related features.

**Competition:** https://www.kaggle.com/competitions/playground-series-s6e9

## Results

| Metric | Score |
|---|---|
| 5-fold cross-validation AUC (mean) | **0.9422** |
| Public leaderboard | 0.94207 |
| Private leaderboard | 0.94147 |

The cross-validation score and the leaderboard scores agree closely, which shows the validation setup is reliable.

Per-fold validation AUC:

| Fold | AUC |
|---|---|
| 1 | 0.9409 |
| 2 | 0.9419 |
| 3 | 0.9432 |
| 4 | 0.9426 |
| 5 | 0.9421 |

> **Note:** this was a late submission made after the competition closed, so it does not appear on the leaderboard. The top public score at the time was about 0.949.

## Dataset

- **Train:** 668,665 rows. **Test:** 286,571 rows.
- **Features:** 13 (7 numeric, 6 categorical), plus an `id` column.
- **Target:** `Will_Buy_EV` (Yes / No). The classes are imbalanced: about 17.5% Yes and 82.5% No.
- **Categorical features:** `Gender`, `City_Type`, `Current_Car_Type`, `Home_Charging_Possible`, `Subsidy_Available`, `Range_Anxiety_Level`.
- **Numeric features include:** `Age`, `Annual_Income_USD`, `Daily_Commute_km`, `Number_of_Cars_Owned`, `Environmental_Concern_Level`, `Charging_Stations_Near_Work`.
- The data files are **not included** in this repository. Download them from the competition page.

## Approach

1. **Exploratory analysis:** compared numeric distributions of buyers and non-buyers, and the buy rate per category. The features that looked most related to buying were `Subsidy_Available`, `Range_Anxiety_Level`, `Current_Car_Type`, and `Home_Charging_Possible`.
2. **Preprocessing:** converted the Yes/No target to 1/0, one-hot encoded the categorical features (24 features in total), and aligned the test columns to the training columns.
3. **Validation:** 5-fold `StratifiedKFold` (shuffled, seed 42), so every fold keeps the same buyer ratio.
4. **Model:** LightGBM classifier with shallow trees (max depth 3), L1 and L2 regularization, row and column subsampling, and early stopping on the validation fold.
5. **Prediction:** each fold's model predicts probabilities on the test set with `predict_proba`, and the five predictions are averaged into `submission.csv`.

The evaluation metric is ROC AUC, so the submission contains probabilities, not 0/1 labels.

## Project structure

```
.
├── README.md
├── notebooks/
│   └── ev_purchase.ipynb      # full workflow: EDA, preprocessing, CV, model, submission
└── data/
    └── raw/                   # train.csv, test.csv, sample_submission.csv (download from Kaggle)
```

## How to run

1. Download `train.csv`, `test.csv`, and `sample_submission.csv` from the competition page into `data/raw/`.
2. Install the packages:
   ```bash
   pip install pandas numpy matplotlib scikit-learn lightgbm xgboost
   ```
3. Open `notebooks/ev_purchase.ipynb` and run all cells from top to bottom.

## Ideas to improve

- In every fold the best iteration reached the tree limit (about 2,000), so the model was still improving. A higher learning rate or more trees could help.
- Feature engineering, such as combining subsidy, home charging, and range anxiety.
- Try other gradient boosting models (XGBoost, CatBoost) and blend them.
- Systematic hyperparameter tuning.

## What I learned

- Turning a text target (Yes/No) into a numeric one before modeling.
- Why probabilities and AUC suit an imbalanced problem better than accuracy.
- Keeping train and test feature columns identical after one-hot encoding.
- Using cross-validation to predict the leaderboard score, and checking that the two agree.

## Author

Harshil
