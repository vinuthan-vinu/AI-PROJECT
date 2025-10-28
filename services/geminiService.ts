// Fix: Add Modality to the import list to support image editing.
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AnalysisType, AnalysisResultData, AnalysisOptions, PredictionSuggestion, InsightSummaryResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getAnalysisPromptAndSchema = (
  analysisType: AnalysisType,
  options: AnalysisOptions
) => {
  const commonSystemInstruction = `You are a world-class data scientist AI assistant. Your task is to perform data analysis on user-provided CSV data and return the results in a structured JSON format that strictly adheres to the provided schema. Do not include any markdown formatting (like \`\`\`json) in your output.`;
  
  switch (analysisType) {
    case AnalysisType.EDA:
      return {
        prompt: `Perform a comprehensive Exploratory Data Analysis on the provided CSV data sample. Return the results as structured arrays of objects.
- For summary statistics on numeric columns, provide an array where each object contains the column name and its stats (mean, std, min, p25, p50, p75, max).
- For missing values, provide an array of objects, each with the column name and the count of missing values.
- For value counts of categorical columns, provide an array of objects. Each object should have the column name and a 'counts' array of objects, where each inner object contains a category 'value' and its 'count'. Limit to the top 10 most frequent values per column.
- For the correlation matrix of numeric columns, provide an array representing the rows of the matrix. Each object should have a 'columnName' for the row and a 'values' array of objects, where each inner object has a 'columnName' and the correlation 'value'.`,
        schema: {
          type: Type.OBJECT,
          properties: {
            summaryStats: {
              type: Type.ARRAY,
              description: "Array of summary statistics for each numeric column.",
              items: {
                type: Type.OBJECT,
                properties: {
                  columnName: { type: Type.STRING },
                  mean: { type: Type.NUMBER },
                  std: { type: Type.NUMBER },
                  min: { type: Type.NUMBER },
                  p25: { type: Type.NUMBER, description: "25th percentile" },
                  p50: { type: Type.NUMBER, description: "50th percentile (median)" },
                  p75: { type: Type.NUMBER, description: "75th percentile" },
                  max: { type: Type.NUMBER }
                },
                required: ["columnName", "mean", "std", "min", "p25", "p50", "p75", "max"]
              }
            },
            valueCounts: {
              type: Type.ARRAY,
              description: "Array of value counts for each categorical column.",
              items: {
                type: Type.OBJECT,
                properties: {
                  columnName: { type: Type.STRING },
                  counts: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        value: { type: Type.STRING },
                        count: { type: Type.INTEGER }
                      },
                      required: ["value", "count"]
                    }
                  }
                },
                required: ["columnName", "counts"]
              }
            },
            missingValues: {
              type: Type.ARRAY,
              description: "Array of missing value counts for each column.",
              items: {
                type: Type.OBJECT,
                properties: {
                  columnName: { type: Type.STRING },
                  count: { type: Type.INTEGER }
                },
                required: ["columnName", "count"]
              }
            },
            correlations: {
              type: Type.ARRAY,
              description: "Correlation matrix represented as an array of row objects.",
              items: {
                type: Type.OBJECT,
                properties: {
                  columnName: { type: Type.STRING, description: "The row's column name." },
                  values: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        columnName: { type: Type.STRING, description: "The column's column name." },
                        value: { type: Type.NUMBER, description: "The correlation value." }
                      },
                      required: ["columnName", "value"]
                    }
                  }
                },
                required: ["columnName", "values"]
              }
            }
          },
          required: ["summaryStats", "valueCounts", "missingValues"]
        },
        systemInstruction: commonSystemInstruction,
      };

    case AnalysisType.Clustering:
      const clusterCols = options.clusteringColumns?.join(', ') || 'the first two numeric columns';
      return {
        prompt: `Perform K-Means clustering on the provided CSV data sample using these columns: ${clusterCols}. Determine an optimal number of clusters (k), but do not exceed 5. Return the cluster assignment for each data point using the selected columns for x and y coordinates, and the coordinates of the cluster centers.`,
        schema: {
          type: Type.OBJECT,
          properties: {
            plotData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                  cluster: { type: Type.INTEGER }
                },
                required: ["x", "y", "cluster"]
              }
            },
            clusterCenters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER }
                },
                required: ["x", "y"]
              }
            },
            k: { type: Type.INTEGER, description: "The number of clusters found." }
          },
          required: ["plotData", "clusterCenters", "k"]
        },
        systemInstruction: commonSystemInstruction,
      };

    case AnalysisType.Classification:
      const classTarget = options.classificationTarget || 'the last column';
      return {
        prompt: `Train a Random Forest Classifier on the provided CSV data sample to predict the target column '${classTarget}'. Use a standard 80/20 train-test split. Return the model's overall accuracy, a classification report as an array of objects (each object containing 'className', 'precision', 'recall', 'f1Score', and 'support'), and feature importances. Do not include an 'accuracy' summary row in the report array.`,
        schema: {
          type: Type.OBJECT,
          properties: {
            accuracy: { type: Type.NUMBER },
            report: {
              type: Type.ARRAY,
              description: "Classification report as an array of objects, one for each class.",
              items: {
                type: Type.OBJECT,
                properties: {
                  className: { type: Type.STRING },
                  precision: { type: Type.NUMBER },
                  recall: { type: Type.NUMBER },
                  f1Score: { type: Type.NUMBER, description: "The F1-score for the class." },
                  support: { type: Type.NUMBER }
                },
                required: ["className", "precision", "recall", "f1Score", "support"]
              }
            },
            featureImportances: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  feature: { type: Type.STRING },
                  importance: { type: Type.NUMBER }
                },
                required: ["feature", "importance"]
              }
            }
          },
          required: ["accuracy", "report", "featureImportances"]
        },
        systemInstruction: commonSystemInstruction,
      };

    case AnalysisType.Regression:
      const regTarget = options.regressionTarget || 'the last column';
      return {
        prompt: `Train a Random Forest Regressor on the provided CSV data sample to predict the numeric target column '${regTarget}'. Use an 80/20 train-test split. Return the Root Mean Squared Error (RMSE), the R-squared value, feature importances, and a sample of 100 actual vs. predicted values for a scatter plot.`,
        schema: {
          type: Type.OBJECT,
          properties: {
            rmse: { type: Type.NUMBER },
            r2: { type: Type.NUMBER },
            featureImportances: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  feature: { type: Type.STRING },
                  importance: { type: Type.NUMBER }
                },
                required: ["feature", "importance"]
              }
            },
            predictions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  actual: { type: Type.NUMBER },
                  predicted: { type: Type.NUMBER }
                },
                required: ["actual", "predicted"]
              }
            }
          },
          required: ["rmse", "r2", "featureImportances", "predictions"]
        },
        systemInstruction: commonSystemInstruction,
      };

    case AnalysisType.TimeSeries:
      const dateCol = options.timeSeriesDateCol || 'the first column';
      const valueCol = options.timeSeriesValueCol || 'the second column';
      return {
        prompt: `Perform a time-series forecast using an appropriate model (like ARIMA) on the provided CSV data sample. The date/time column is '${dateCol}' and the value column to forecast is '${valueCol}'. Provide the last 50 historical data points and the next 20 forecasted data points. The dates should be in a consistent, chartable format (e.g., 'YYYY-MM-DD').`,
        schema: {
          type: Type.OBJECT,
          properties: {
            forecast: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  value: { type: Type.NUMBER }
                },
                required: ["date", "value"]
              }
            },
            historical: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  value: { type: Type.NUMBER }
                },
                required: ["date", "value"]
              }
            }
          },
          required: ["forecast", "historical"]
        },
        systemInstruction: commonSystemInstruction,
      };
      
    case AnalysisType.ThreatAnalysis:
        const threatTextCol = options.threatTextCol;
        const threatEntityCol = options.threatEntityCol;
        if (!threatTextCol || !threatEntityCol) {
            throw new Error("Text column and Entity column must be selected for Threat Analysis.");
        }
        return {
            prompt: `Act as a security and relationship analyst. Analyze the text content in the '${threatTextCol}' column to identify potential threats, harassment, or problematic behavior associated with entities from the '${threatEntityCol}' column.
- Identify and flag entities exhibiting negative or threatening behavior. Assign a threat level ('High', 'Medium', 'Low') and provide a brief reason and supporting text evidence.
- Analyze the interactions to identify key relationships between entities (e.g., antagonism, collaboration). Describe these relationships and their overall sentiment.
- Provide a brief overall summary of your findings.
This analysis is for preliminary screening; treat results with caution.`,
            schema: {
                type: Type.OBJECT,
                properties: {
                    summary: {
                        type: Type.STRING,
                        description: "A high-level summary of the findings."
                    },
                    flaggedEntities: {
                        type: Type.ARRAY,
                        description: "An array of entities that have been flagged for problematic behavior.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                entityId: { type: Type.STRING },
                                threatLevel: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                                reason: { type: Type.STRING },
                                evidence: { type: Type.ARRAY, items: { type: Type.STRING } }
                            },
                            required: ["entityId", "threatLevel", "reason", "evidence"]
                        }
                    },
                    relationships: {
                        type: Type.ARRAY,
                        description: "An array describing key relationships between entities.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                entities: { type: Type.ARRAY, items: { type: Type.STRING } },
                                description: { type: Type.STRING },
                                sentiment: { type: Type.STRING }
                            },
                            required: ["entities", "description", "sentiment"]
                        }
                    }
                },
                required: ["summary", "flaggedEntities", "relationships"]
            },
            systemInstruction: commonSystemInstruction,
        };

    default:
      throw new Error("Invalid analysis type");
  }
};

export const performAnalysis = async (
  csvData: string,
  analysisType: AnalysisType,
  options: AnalysisOptions
): Promise<AnalysisResultData> => {
  const { prompt, schema, systemInstruction } = getAnalysisPromptAndSchema(analysisType, options);

  try {
    // Sample the data to prevent exceeding token limits with large files.
    const lines = csvData.trim().split('\n');
    const header = lines[0];
    const dataRows = lines.slice(1);
    
    const sampleSize = 200;
    const dataSample = dataRows.length > sampleSize 
      ? dataRows.slice(0, sampleSize) 
      : dataRows;
      
    const sampledCsvData = [header, ...dataSample].join('\n');
    
    const fullPrompt = `${prompt}\n\nHere is the CSV data:\n\n${sampledCsvData}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      // Use the explicit Content object structure instead of a raw string for better reliability.
      contents: { parts: [{ text: fullPrompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("API returned an empty response.");
    }
    
    // Defensive parsing to handle cases where the model might still wrap the JSON in markdown.
    let jsonString = text.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.substring(7, jsonString.length - 3).trim();
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.substring(3, jsonString.length - 3).trim();
    }

    return JSON.parse(jsonString) as AnalysisResultData;

  } catch (error) {
    console.error(`Error performing Gemini analysis for ${analysisType}:`, error);

    if (error instanceof SyntaxError) {
      // This indicates a JSON parsing error, meaning the API response was not valid JSON.
      console.error("Failed to parse JSON response from API.");
      throw new Error(`The API returned a malformed response for ${analysisType}. This may be a temporary issue, please try again.`);
    }

    throw new Error(`Failed to perform ${analysisType}. Please check your data and column selections. The API may be temporarily unavailable or the data could not be processed.`);
  }
};

export const getPredictionSuggestions = async (csvData: string): Promise<PredictionSuggestion[]> => {
  // Sample the data
  const lines = csvData.trim().split('\n');
  const header = lines[0];
  const dataRows = lines.slice(1);
  const sampleSize = 50; // Smaller sample is fine for this
  const dataSample = dataRows.length > sampleSize 
    ? dataRows.slice(0, sampleSize) 
    : dataRows;
  const sampledCsvData = [header, ...dataSample].join('\n');

  const prompt = `As a data analyst, your task is to suggest potential machine learning prediction tasks based on a sample of a CSV file. Analyze the column headers and the first few rows of data. Provide up to 3 diverse and relevant suggestions. For each suggestion, specify the analysis type (from the provided enum), the columns to be used, a short, catchy title, and a brief justification explaining why this would be a useful prediction.

  Possible Analysis Types:
  - "Classification"
  - "Regression"
  - "Time-Series Forecasting"
  
  Focus on the most plausible and high-value predictions. For example, a column with many unique string values is likely an ID and not a good target. A column with two distinct values is a great classification target. A column with continuous numbers could be a regression target. A date column paired with a numeric column is ideal for time-series forecasting.

  Here is the CSV data sample:
  ${sampledCsvData}`;

  const schema: any = { // Using `any` for schema to match existing pattern
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { 
          type: Type.STRING,
          description: "A short, catchy title for the suggested analysis (e.g., 'Predict Sales Volume')."
        },
        analysisType: {
          type: Type.STRING,
          enum: [AnalysisType.Classification, AnalysisType.Regression, AnalysisType.TimeSeries]
        },
        options: {
          type: Type.OBJECT,
          properties: {
            classificationTarget: { type: Type.STRING },
            regressionTarget: { type: Type.STRING },
            timeSeriesDateCol: { type: Type.STRING },
            timeSeriesValueCol: { type: Type.STRING },
          },
          description: "The column(s) to use for the analysis. Only include the relevant properties for the analysisType."
        },
        justification: {
          type: Type.STRING,
          description: "A brief explanation of why this is a useful prediction to make from this data."
        }
      },
      required: ["title", "analysisType", "options", "justification"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Use flash for speed
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) return [];
    
    // Use the same defensive parsing
    let jsonString = text.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.substring(7, jsonString.length - 3).trim();
    }
    
    return JSON.parse(jsonString) as PredictionSuggestion[];
  } catch (error) {
    console.error("Error getting prediction suggestions:", error);
    // Return empty array on failure to not crash the app
    return [];
  }
};


// Fix: Add and export the editImage function to resolve the import error in ImageEditor.tsx
export const editImage = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("API did not return an image.");

  } catch (error) {
    console.error(`Error performing Gemini image edit:`, error);
    throw new Error(`Failed to edit image. The API may be temporarily unavailable or the prompt could not be processed.`);
  }
};


export const generateInsightsSummary = async (csvData: string): Promise<InsightSummaryResult> => {
  const lines = csvData.trim().split('\n');
  const header = lines[0];
  const dataRows = lines.slice(1);
  const sampleSize = 200;
  const dataSample = dataRows.length > sampleSize ? dataRows.slice(0, sampleSize) : dataRows;
  const sampledCsvData = [header, ...dataSample].join('\n');

  const prompt = `You are an expert data scientist. Your task is to analyze a sample of a CSV dataset and generate a summary of the most significant, human-readable predictive insights.
- First, identify key columns that could be used as targets for prediction (both classification and regression).
- Then, reason about the relationships between features and these targets.
- Finally, synthesize your findings into 3-5 key insights. Each insight should be a concise, impactful statement about a potential prediction. Frame them as if you are explaining the findings to a non-technical stakeholder.
- For each insight, provide a title, a clear description (e.g., 'Users aged 25-45 who smoke have a 30% higher risk of health issues based on the 'has_health_issue' column.'), and a confidence level ('High', 'Medium', 'Low') based on how clear the pattern seems from the data sample.

Here is the CSV data sample:
${sampledCsvData}`;

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "A short, catchy title for the insight."
        },
        description: {
          type: Type.STRING,
          description: "The detailed, human-readable insight or prediction."
        },
        confidence: {
          type: Type.STRING,
          enum: ['High', 'Medium', 'Low'],
          description: "Your confidence in this prediction based on the data sample."
        }
      },
      required: ["title", "description", "confidence"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("API returned an empty response for insights summary.");
    }

    let jsonString = text.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.substring(7, jsonString.length - 3).trim();
    }

    return JSON.parse(jsonString) as InsightSummaryResult;
  } catch (error) {
    console.error("Error generating insights summary:", error);
    throw new Error("Failed to generate the insights summary. The model may be temporarily unavailable or could not process the data.");
  }
};
