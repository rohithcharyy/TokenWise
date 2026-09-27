import {
  useEffect,
  useState,
} from "react";

import {
  Activity,
  ArrowDownRight,
  BarChart3,
  Bot,
  Clock3,
  Coins,
  Database,
  TrendingDown,
  Zap,
} from "lucide-react";

import StatCard from "../components/common/StatCard";

import {
  getAnalyticsData,
} from "../services/analytics";


/* =========================================================
   FORMATTERS
   ========================================================= */

function formatNumber(value) {

  return Number(value || 0)
    .toLocaleString();

}


function formatCompactNumber(value) {

  const number =
    Number(value || 0);


  if (number >= 1000000) {

    return `${(
      number / 1000000
    ).toFixed(1)}M`;

  }


  if (number >= 1000) {

    return `${(
      number / 1000
    ).toFixed(1)}K`;

  }


  return number.toLocaleString();

}


function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(4)}`;
}


function formatTime(timestamp) {

  if (!timestamp) {

    return "-";

  }


  const date =
    new Date(timestamp);


  const now =
    new Date();


  const diff =
    Math.floor(
      (now - date) /
      60000
    );


  if (diff < 1) {

    return "Just now";

  }


  if (diff < 60) {

    return `${diff} min ago`;

  }


  const hours =
    Math.floor(
      diff / 60
    );


  if (hours < 24) {

    return `${hours} hr ago`;

  }


  const days =
    Math.floor(
      hours / 24
    );


  return `${days} day${
    days > 1
      ? "s"
      : ""
  } ago`;

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function Dashboard() {

  const [
    analytics,
    setAnalytics,
  ] = useState(
    getAnalyticsData()
  );
 
  const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
};

  /* =======================================================
     REFRESH ANALYTICS
     ======================================================= */

  useEffect(() => {

    function refreshAnalytics() {

      setAnalytics(
        getAnalyticsData()
      );

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

      clearInterval(
        interval
      );

    };

  }, []);


  /* =======================================================
     CALCULATIONS
     ======================================================= */

  const averageReduction =
    analytics.totalTokensBefore > 0

      ? (
          analytics.totalTokensSaved /
          analytics.totalTokensBefore
        ) * 100

      : 0;


  const modelSavings =
    Array.isArray(
      analytics.modelUsage
    )

      ? [...analytics.modelUsage]
          .sort(
            (a, b) =>
              Number(
                b.tokensSaved || 0
              ) -
              Number(
                a.tokensSaved || 0
              )
          )

      : [];


  const recentActivity =
    Array.isArray(
      analytics.activities
    )
      ? analytics.activities
      : [];


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
            {getGreeting()}, Rohith
          </h1>

          <p>
            Here's a summary of your TokenWise activity for today.
          </p>

        </div>


        <div className="date-display">

          <Clock3 size={15} />

          Today

        </div>

      </div>


      {/* =================================================
          STATS
      ================================================= */}

      <section className="stats-grid">

        <StatCard
          label="Tokens Saved Today"
          value={formatCompactNumber(
            analytics.totalTokensSaved
          )}
          description="Across all connected models"
          icon={Zap}
        />


        <StatCard
          label="Cost Saved"
          value={formatCurrency(
            analytics.totalCostSaved
          )}
          description="Estimated savings from compression"
          icon={Coins}
        />


        <StatCard
          label="Requests Optimized"
          value={formatNumber(
            analytics.totalRequests
          )}
          description="Successful compression requests"
          icon={Activity}
        />


        <StatCard
          label="Average Reduction"
          value={`${averageReduction.toFixed(1)}%`}
          description="Average context reduction"
          icon={TrendingDown}
        />

      </section>


      {/* =================================================
          MAIN GRID
      ================================================= */}

      <section className="dashboard-grid">


        {/* =================================================
            MODEL SAVINGS
        ================================================= */}

        <div className="dashboard-card savings-card">

          <div className="card-header">

            <div>

              <h2>
                LLM Savings
              </h2>

              <p>
                Compression performance by model.
              </p>

            </div>

            <BarChart3 size={18} />

          </div>


          <div className="model-list">

            {modelSavings.length === 0 ? (

              <div className="dashboard-empty">

                No model activity yet.

                <span>
                  Send a message from AI Workspace to generate data.
                </span>

              </div>

            ) : (

              modelSavings.map(
                (model) => {

                  const tokensBefore =
                    Number(
                      model.tokensBefore ||
                      0
                    );


                  const tokensSaved =
                    Number(
                      model.tokensSaved ||
                      0
                    );


                  const reduction =
                    tokensBefore > 0

                      ? (
                          tokensSaved /
                          tokensBefore
                        ) * 100

                      : 0;


                  return (

                    <div
                      className="model-row"
                      key={model.model}
                    >

                      <div className="model-name">

                        <div className="model-icon">

                          <Bot size={15} />

                        </div>


                        <div>

                          <strong>
                            {model.model}
                          </strong>

                          <span>
                            {model.requests} requests
                          </span>

                        </div>

                      </div>


                      <div className="model-metric">

                        <strong>
                          {formatCompactNumber(
                            tokensSaved
                          )}
                        </strong>

                        <span>
                          tokens saved
                        </span>

                      </div>


                      <div className="reduction">

                        <ArrowDownRight
                          size={14}
                        />

                        {reduction.toFixed(1)}%

                      </div>

                    </div>

                  );

                }
              )

            )}

          </div>

        </div>


        {/* =================================================
            OVERVIEW
        ================================================= */}

        <div className="dashboard-card overview-card">

          <div className="card-header">

            <div>

              <h2>
                Today's Overview
              </h2>

              <p>
                Token usage before and after optimization.
              </p>

            </div>

            <Database size={18} />

          </div>


          <div className="overview-content">

            <div className="overview-number">

              <span>
                Total tokens processed
              </span>

              <strong>
                {formatCompactNumber(
                  analytics.totalTokensBefore
                )}
              </strong>

            </div>


            <div className="usage-bars">


              {/* BEFORE */}

              <div className="usage-item">

                <div>

                  <span>
                    Before compression
                  </span>

                  <strong>
                    {formatCompactNumber(
                      analytics.totalTokensBefore
                    )}
                  </strong>

                </div>


                <div className="usage-bar">

                  <div
                    className="usage-fill before"
                    style={{
                      width: "100%",
                    }}
                  />

                </div>

              </div>


              {/* AFTER */}

              <div className="usage-item">

                <div>

                  <span>
                    After compression
                  </span>

                  <strong>
                    {formatCompactNumber(
                      analytics.totalTokensAfter
                    )}
                  </strong>

                </div>


                <div className="usage-bar">

                  <div
                    className="usage-fill after"
                    style={{
                      width:
                        analytics.totalTokensBefore > 0
                          ? `${
                              (
                                analytics.totalTokensAfter /
                                analytics.totalTokensBefore
                              ) * 100
                            }%`
                          : "0%",
                    }}
                  />

                </div>

              </div>


            </div>


            {/* SAVINGS */}

            <div className="overview-saving">

              <TrendingDown size={17} />

              <div>

                <strong>

                  {formatCompactNumber(
                    analytics.totalTokensSaved
                  )}

                  {" "}
                  tokens reduced

                </strong>

                <span>

                  {averageReduction.toFixed(1)}%
                  {" "}
                  average reduction

                </span>

              </div>

            </div>


            {/* COST */}

            <div className="overview-saving">

              <Coins size={17} />

              <div>

                <strong>

                  {formatCurrency(
                    analytics.totalCostSaved
                  )}

                  {" "}
                  estimated cost saved

                </strong>

                <span>
                  Based on configured model pricing
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          RECENT ACTIVITY
      ================================================= */}

      <section className="dashboard-card activity-card">

        <div className="card-header">

          <div>

            <h2>
              Recent Activity
            </h2>

            <p>
              Your latest TokenWise optimization requests.
            </p>

          </div>

        </div>


        <div className="activity-table">


          <div className="activity-header">

            <span>
              Model
            </span>

            <span>
              Operation
            </span>

            <span>
              Before
            </span>

            <span>
              After
            </span>

            <span>
              Saved
            </span>

            <span>
              Time
            </span>

          </div>


          {recentActivity.length === 0 ? (

            <div className="dashboard-empty">

              No activity yet.

            </div>

          ) : (

            recentActivity
              .slice(0, 10)
              .map(
                (
                  activity,
                  index
                ) => (

                  <div
                    className="activity-row"
                    key={
                      `${
                        activity.timestamp ||
                        "activity"
                      }-${index}`
                    }
                  >

                    <span className="activity-model">

                      <Bot size={14} />

                      {activity.model}

                    </span>


                    <span>
                      {activity.operation}
                    </span>


                    <span>
                      {formatNumber(
                        activity.before
                      )}
                    </span>


                    <span>
                      {formatNumber(
                        activity.after
                      )}
                    </span>


                    <span className="saved-value">

                      -
                      {formatNumber(
                        activity.saved
                      )}

                    </span>


                    <span className="activity-time">

                      {formatTime(
                        activity.timestamp
                      )}

                    </span>

                  </div>

                )
              )

          )}

        </div>

      </section>

    </div>

  );

}


export default Dashboard;