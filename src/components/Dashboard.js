/**
 * Unit Comparison Dashboard Component
 * Shows statistics comparing nautical vs metric calculations
 */

export class Dashboard {
  constructor(container, stats) {
    this.container = container;
    this.stats = stats;
    this.render();
  }

  update(stats) {
    this.stats = stats;
    this.render();
  }

  render() {
    const { calculationsInNautical, calculationsInMetric, totalTime, hintsUsed } = this.stats;

    // Estimate time savings (metric calculations take roughly 2x longer)
    const nauticalTime = calculationsInNautical * 30; // ~30 seconds avg
    const metricTime = calculationsInMetric * 75; // ~75 seconds avg
    const estimatedMetricTime = (calculationsInNautical + calculationsInMetric) * 75;
    const timeSaved = Math.max(0, estimatedMetricTime - totalTime);

    // Calculate percentages
    const totalCalcs = calculationsInNautical + calculationsInMetric;
    const nauticalPercent = totalCalcs > 0 ? Math.round((calculationsInNautical / totalCalcs) * 100) : 0;
    const metricPercent = 100 - nauticalPercent;

    this.container.innerHTML = `
      <div class="space-y-6 p-4">
        <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span class="text-2xl">📊</span>
          Unit Comparison Dashboard
        </h3>

        <div class="grid grid-cols-2 gap-4">
          <!-- Nautical Stats -->
          <div class="stat bg-sky-50 rounded-xl p-4">
            <div class="stat-figure text-sky-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div class="stat-title text-sky-600">Nautical</div>
            <div class="stat-value text-sky-700">${calculationsInNautical}</div>
            <div class="stat-desc text-sky-500">calculations</div>
          </div>

          <!-- Metric Stats -->
          <div class="stat bg-slate-100 rounded-xl p-4">
            <div class="stat-figure text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="stat-title text-slate-600">Metric</div>
            <div class="stat-value text-slate-700">${calculationsInMetric}</div>
            <div class="stat-desc text-slate-500">calculations</div>
          </div>
        </div>

        <!-- Time Comparison -->
        <div class="card bg-emerald-50 p-4">
          <h4 class="font-medium text-emerald-800 mb-2">⏱️ Time Efficiency</h4>
          <div class="flex items-center gap-4">
            <div class="flex-1">
              <div class="text-sm text-emerald-600 mb-1">Using nautical miles</div>
              <div class="h-3 bg-emerald-200 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-500 rounded-full" style="width: ${Math.min(100, nauticalPercent)}%"></div>
              </div>
            </div>
            <div class="text-2xl font-bold text-emerald-700">
              ${nauticalPercent}%
            </div>
          </div>
          ${timeSaved > 0 ? `
            <p class="text-sm text-emerald-600 mt-3">
              🎉 Estimated time saved: <strong>${Math.round(timeSaved / 60)} minutes</strong> vs using only kilometers
            </p>
          ` : ''}
        </div>

        <!-- Conversion Comparison -->
        <div class="card bg-orange-50 p-4">
          <h4 class="font-medium text-orange-800 mb-3">🔄 Conversion Steps</h4>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-orange-700">Nautical (north/south)</span>
              <div class="flex items-center gap-1">
                <span class="badge badge-sm bg-emerald-100 text-emerald-700">1 step</span>
                <span class="text-xs text-orange-600">Speed × Time = Minutes</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-orange-700">Metric</span>
              <div class="flex items-center gap-1">
                <span class="badge badge-sm bg-orange-200 text-orange-800">3 steps</span>
                <span class="text-xs text-orange-600">km → nm → minutes → degrees</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Mental Math Comparison -->
        <div class="card bg-violet-50 p-4">
          <h4 class="font-medium text-violet-800 mb-3">🧠 Mental Math Friendly</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="text-center p-3 bg-white rounded-lg">
              <div class="text-violet-600 mb-1">Nautical</div>
              <div class="text-3xl mb-1">✓</div>
              <div class="text-xs text-violet-500">1 nm = 1 minute</div>
            </div>
            <div class="text-center p-3 bg-white rounded-lg">
              <div class="text-violet-600 mb-1">Metric</div>
              <div class="text-3xl mb-1">✗</div>
              <div class="text-xs text-violet-500">÷ 1.852 needed</div>
            </div>
          </div>
        </div>

        <!-- Key Insight -->
        <div class="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h4 class="font-bold">Why Nautical Units Persist</h4>
            <p class="text-sm">They're not just tradition—they're elegantly designed to work with Earth's coordinate system. When speed, distance, and coordinates all share the same base (degrees/minutes), navigation becomes intuitive.</p>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Create a mini dashboard widget
 */
export function createMiniDashboard(nauticalCalcs, metricCalcs) {
  const total = nauticalCalcs + metricCalcs;
  const nauticalPercent = total > 0 ? Math.round((nauticalCalcs / total) * 100) : 0;

  return `
    <div class="inline-flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
      <span class="text-sm text-slate-600">Calculations:</span>
      <div class="flex items-center gap-1">
        <span class="badge badge-sm badge-primary">${nauticalCalcs} nm</span>
        <span class="text-slate-400">vs</span>
        <span class="badge badge-sm badge-ghost">${metricCalcs} km</span>
      </div>
      ${total >= 3 ? `
        <div class="text-xs text-emerald-600 font-medium">
          ${nauticalPercent}% nautical
        </div>
      ` : ''}
    </div>
  `;
}
