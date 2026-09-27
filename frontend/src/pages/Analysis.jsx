import {
  useEffect,
  useState,
} from "react";

import {
  getAnalyticsData,
} from "../services/analytics";

import {
  TrendingDown,
  Zap,
  MessageSquare,
  Coins,
  BarChart3,
  LineChart,
} from "lucide-react";


/* =========================================================
   LINE GRAPH
   ========================================================= */

function LineGraph({ data }) {

  const [hoveredPoint, setHoveredPoint] =
    useState(null);

  const safeData =
    Array.isArray(data) ? data : [];

  const width = 900;
  const height = 270;

  const paddingLeft = 55;
  const paddingRight = 25;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth =
    width -
    paddingLeft -
    paddingRight;

  const chartHeight =
    height -
    paddingTop -
    paddingBottom;

  const maxValue =
    Math.max(
      3000,
      ...safeData.flatMap((item) => [
        Number(item.before) || 0,
        Number(item.after) || 0,
      ])
    );

  const getX = (index) => {

    if (safeData.length <= 1) {
      return paddingLeft + chartWidth / 2;
    }

    return (
      paddingLeft +
      (index / (safeData.length - 1)) *
        chartWidth
    );

  };

  const getY = (value) => {

    return (
      paddingTop +
      chartHeight -
      ((Number(value) || 0) / maxValue) *
        chartHeight
    );

  };

  const beforePoints =
    safeData
      .map((item, index) => {

        return `${getX(index)},${getY(
          item.before
        )}`;

      })
      .join(" ");

  const afterPoints =
    safeData
      .map((item, index) => {

        return `${getX(index)},${getY(
          item.after
        )}`;

      })
      .join(" ");

  const yValues = [
    0,
    Math.round(maxValue * 0.25),
    Math.round(maxValue * 0.5),
    Math.round(maxValue * 0.75),
    Math.round(maxValue),
  ];

  return (

    <div className="analytics-line-chart">

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="analytics-svg"
        preserveAspectRatio="none"
      >

        {/* GRID */}

        {yValues.map((value) => {

          const y = getY(value);

          return (

            <g key={value}>

              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                className="analytics-grid-line"
              />

              <text
                x={paddingLeft - 10}
                y={y + 4}
                textAnchor="end"
                className="analytics-axis-label"
              >
                {value.toLocaleString()}
              </text>

            </g>

          );

        })}


        {/* BEFORE LINE */}

        <polyline
          points={beforePoints}
          fill="none"
          className="analytics-line analytics-line-before"
        />


        {/* AFTER LINE */}

        <polyline
          points={afterPoints}
          fill="none"
          className="analytics-line analytics-line-after"
        />


        {/* DATA POINTS */}

        {safeData.map((item, index) => {

          const x =
            getX(index);

          const beforeY =
            getY(item.before);

          const afterY =
            getY(item.after);

          return (

            <g
              key={`${item.day}-${index}`}
            >

              {/* BEFORE */}

              <circle
                cx={x}
                cy={beforeY}
                r="5"
                className="analytics-point-before"

                onMouseEnter={() =>
                  setHoveredPoint({
                    type: "before",
                    x,
                    y: beforeY,
                    day: item.day,
                    value:
                      Number(item.before) || 0,
                  })
                }

                onMouseLeave={() =>
                  setHoveredPoint(null)
                }
              />


              {/* AFTER */}

              <circle
                cx={x}
                cy={afterY}
                r="5"
                className="analytics-point-after"

                onMouseEnter={() =>
                  setHoveredPoint({
                    type: "after",
                    x,
                    y: afterY,
                    day: item.day,
                    value:
                      Number(item.after) || 0,
                  })
                }

                onMouseLeave={() =>
                  setHoveredPoint(null)
                }
              />


              {/* DAY */}

              <text
                x={x}
                y={height - 10}
                textAnchor="middle"
                className="analytics-day-label"
              >
                {item.day}
              </text>

            </g>

          );

        })}

      </svg>


      {/* TOOLTIP */}

      {hoveredPoint && (

        <div
          className="analytics-tooltip"
          style={{
            left:
              `${(hoveredPoint.x / width) * 100}%`,
            top:
              `${(hoveredPoint.y / height) * 100}%`,
          }}
        >

          <strong>
            {hoveredPoint.day}
          </strong>

          <span>

            {hoveredPoint.type === "before"
              ? "Before optimization"
              : "After optimization"}

          </span>

          <b>
            {hoveredPoint.value.toLocaleString()}
            {" "}
            tokens
          </b>

        </div>

      )}

    </div>

  );

}


/* =========================================================
   BAR GRAPH
   ========================================================= */

function BarGraph({ data }) {

  const [hoveredBar, setHoveredBar] =
    useState(null);

  const safeData =
    Array.isArray(data) ? data : [];

  const maxValue =
    Math.max(
      3000,
      ...safeData.flatMap((item) => [
        Number(item.before) || 0,
        Number(item.after) || 0,
      ])
    );

  return (

    <div className="analytics-bar-chart">

      {/* Y AXIS */}

      <div className="analytics-y-axis">

        {[100, 75, 50, 25, 0].map(
          (percentage) => {

            const value =
              Math.round(
                (maxValue * percentage) /
                  100
              );

            return (

              <span key={percentage}>
                {value.toLocaleString()}
              </span>

            );

          }
        )}

      </div>


      {/* GRAPH AREA */}

      <div className="analytics-bar-area">


        {/* GRID */}

        <div className="analytics-bar-grid">

          {[0, 25, 50, 75, 100].map(
            (position) => (

              <span
                key={position}
                style={{
                  bottom:
                    `${position}%`,
                }}
              />

            )
          )}

        </div>


        {/* BARS */}

        <div className="analytics-bars">

          {safeData.map((item, index) => {

            const beforeHeight =
              ((Number(item.before) || 0) /
                maxValue) *
              100;

            const afterHeight =
              ((Number(item.after) || 0) /
                maxValue) *
              100;

            return (

              <div
                className="analytics-bar-column"
                key={`${item.day}-${index}`}
              >

                <div className="analytics-bar-pair">


                  {/* BEFORE */}

                  <div
                    className="analytics-bar analytics-bar-before"

                    style={{
                      height:
                        `${beforeHeight}%`,
                    }}

                    onMouseEnter={() =>
                      setHoveredBar({
                        day: item.day,
                        type: "before",
                        value:
                          Number(item.before) ||
                          0,
                      })
                    }

                    onMouseLeave={() =>
                      setHoveredBar(null)
                    }
                  />


                  {/* AFTER */}

                  <div
                    className="analytics-bar analytics-bar-after"

                    style={{
                      height:
                        `${afterHeight}%`,
                    }}

                    onMouseEnter={() =>
                      setHoveredBar({
                        day: item.day,
                        type: "after",
                        value:
                          Number(item.after) ||
                          0,
                      })
                    }

                    onMouseLeave={() =>
                      setHoveredBar(null)
                    }
                  />

                </div>


                <span className="analytics-bar-day">
                  {item.day}
                </span>

              </div>

            );

          })}

        </div>


        {/* TOOLTIP */}

        {hoveredBar && (

          <div className="analytics-bar-tooltip">

            <strong>
              {hoveredBar.day}
            </strong>

            <span>

              {hoveredBar.type === "before"
                ? "Before optimization"
                : "After optimization"}

            </span>

            <b>
              {hoveredBar.value.toLocaleString()}
              {" "}
              tokens
            </b>

          </div>

        )}

      </div>

    </div>

  );

}


/* =========================================================
   ANALYSIS PAGE
   ========================================================= */

function Analysis() {

  /* =======================================================
     GRAPH TYPE
     ======================================================= */

  const [graphType, setGraphType] =
    useState("bar");


  /* =======================================================
     ANALYTICS DATA
     ======================================================= */

  const [analyticsData, setAnalyticsData] =
    useState(() => {

      const data =
        getAnalyticsData();

      return data || {

        totalTokensBefore: 0,
        totalTokensAfter: 0,
        totalTokensSaved: 0,
        conversations: 0,
        modelUsage: [],
        dailyUsage: {},

      };

    });


  /* =======================================================
     REFRESH ANALYTICS
     ======================================================= */

  useEffect(() => {

    function refreshAnalytics() {

      const data =
        getAnalyticsData();

      if (data) {

        setAnalyticsData(data);

      }

    }


    window.addEventListener(
      "storage",
      refreshAnalytics
    );


    const interval =
      setInterval(
        refreshAnalytics,
        1000
      );


    return () => {

      window.removeEventListener(
        "storage",
        refreshAnalytics
      );

      clearInterval(interval);

    };

  }, []);


  /* =======================================================
     SAFE VALUES
     ======================================================= */

  const totalTokensBefore =
    Number(
      analyticsData.totalTokensBefore
    ) || 0;

  const totalTokensAfter =
    Number(
      analyticsData.totalTokensAfter
    ) || 0;

  const totalTokensSaved =
    Number(
      analyticsData.totalTokensSaved
    ) || 0;

  const conversations =
    Number(
      analyticsData.conversations
    ) || 0;


  /* =======================================================
     COMPRESSION PERCENTAGE
     ======================================================= */

  const compressionPercentage =
    totalTokensBefore > 0

      ? (
          totalTokensSaved /
          totalTokensBefore
        ) * 100

      : 0;


  /* =======================================================
     DAILY USAGE
     ======================================================= */

  const dailyUsage =
    Object.entries(
      analyticsData.dailyUsage || {}
    )

      .sort(
        ([dateA], [dateB]) =>
          new Date(dateA) -
          new Date(dateB)
      )

      .slice(-7)

      .map(
        ([date, values]) => {

          const parsedDate =
            new Date(date);

          return {

            day:
              parsedDate.toLocaleDateString(
                "en-US",
                {
                  weekday: "short",
                }
              ),

            before:
              Number(values?.before) || 0,

            after:
              Number(values?.after) || 0,

          };

        }
      );


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <div className="page-content">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-heading">

        <div>

          <h1>
            Analysis
          </h1>

          <p>
            Analyze token usage and compression performance.
          </p>

        </div>

      </div>


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="analysis-summary-grid">


        <div className="analysis-card">

          <div className="analysis-card-icon">
            <Coins size={20} />
          </div>

          <div>

            <span>
              Tokens Processed
            </span>

            <strong>
              {totalTokensBefore.toLocaleString()}
            </strong>

            <small>
              before optimization
            </small>

          </div>

        </div>


        <div className="analysis-card">

          <div className="analysis-card-icon">
            <TrendingDown size={20} />
          </div>

          <div>

            <span>
              Tokens Saved
            </span>

            <strong>
              {totalTokensSaved.toLocaleString()}
            </strong>

            <small>
              tokens removed
            </small>

          </div>

        </div>


        <div className="analysis-card">

          <div className="analysis-card-icon">
            <Zap size={20} />
          </div>

          <div>

            <span>
              Compression
            </span>

            <strong>
              {compressionPercentage.toFixed(1)}%
            </strong>

            <small>
              overall reduction
            </small>

          </div>

        </div>


        <div className="analysis-card">

          <div className="analysis-card-icon">
            <MessageSquare size={20} />
          </div>

          <div>

            <span>
              Conversations
            </span>

            <strong>
              {conversations}
            </strong>

            <small>
              conversations analyzed
            </small>

          </div>

        </div>

      </div>


      {/* =================================================
          TOKEN USAGE
      ================================================= */}

      <div className="analysis-section">

        <div className="analysis-section-header">

          <div>

            <h2>
              Token Usage
            </h2>

            <p>
              Compare token usage before and after TokenWise optimization.
            </p>

          </div>


          {/* GRAPH SWITCH */}

          <button
            className="analysis-chart-switch"

            onClick={() =>
              setGraphType(
                graphType === "bar"
                  ? "line"
                  : "bar"
              )
            }

            title={
              graphType === "bar"
                ? "Switch to line graph"
                : "Switch to bar graph"
            }

            type="button"
          >

            {graphType === "bar" ? (
              <LineChart size={19} />
            ) : (
              <BarChart3 size={19} />
            )}

          </button>

        </div>


        {/* GRAPH */}

        <div className="analysis-chart-container">

          {dailyUsage.length > 0 ? (

            graphType === "bar" ? (

              <BarGraph
                data={dailyUsage}
              />

            ) : (

              <LineGraph
                data={dailyUsage}
              />

            )

          ) : (

            <div
              style={{
                padding: "40px",
                textAlign: "center",
              }}
            >

              No analytics data available yet.

            </div>

          )}

        </div>


        {/* LEGEND */}

        <div className="analysis-chart-legend">

          <span>

            <i className="legend-before" />

            Before optimization

          </span>


          <span>

            <i className="legend-after" />

            After optimization

          </span>

        </div>

      </div>


      {/* =================================================
          MODEL USAGE
      ================================================= */}

      <div className="analysis-section">

        <div className="analysis-section-header">

          <div>

            <h2>
              Model Usage
            </h2>

            <p>
              Usage breakdown across connected LLM providers.
            </p>

          </div>

        </div>


        <div className="analysis-model-list">

          {Array.isArray(
            analyticsData.modelUsage
          ) &&
          analyticsData.modelUsage.length > 0 ? (

            analyticsData.modelUsage.map(
              (item, index) => (

                <div
                  className="analysis-model-row"
                  key={
                    item.model ||
                    `model-${index}`
                  }
                >

                  <div>

                    <strong>
                      {item.model}
                    </strong>

                    <span>
                      {Number(
                        item.requests
                      ) || 0}
                      {" "}
                      requests
                    </span>

                  </div>


                  <div className="analysis-model-tokens">

                    <strong>
                      {(
                        Number(item.tokens) ||
                        0
                      ).toLocaleString()}
                    </strong>

                    <span>
                      tokens
                    </span>

                  </div>

                </div>

              )
            )

          ) : (

            <div
              style={{
                padding: "20px",
              }}
            >

              No model usage data yet.

            </div>

          )}

        </div>

      </div>


      {/* =================================================
          PERFORMANCE
      ================================================= */}

      <div className="analysis-section analysis-performance">

        <div>

          <span>
            TokenWise Performance
          </span>

          <h2>

            {totalTokensSaved.toLocaleString()}

            {" "}

            tokens saved

          </h2>

          <p>

            TokenWise reduced the total context sent to connected
            language models by approximately{" "}

            <strong>
              {compressionPercentage.toFixed(1)}%
            </strong>.

          </p>

        </div>


        <div className="analysis-performance-icon">

          <TrendingDown size={32} />

        </div>

      </div>

    </div>

  );

}


export default Analysis;