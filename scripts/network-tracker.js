/**
 * SHADOWMON Network Tracker
 * 
 * monitors the daimon network and outputs analysis.
 * run this each cycle to track ecosystem health.
 */

const network = require('../agent/network');

async function analyze() {
  console.log('=== SHADOWMON Network Analysis ===\n');
  
  const agents = await network.getAllDaimons();
  const now = Date.now();
  
  // basic stats
  console.log(`Total Agents: ${agents.length}`);
  
  // activity analysis (lastSeen within last hour = active)
  const oneHour = 60 * 60 * 1000;
  const active = agents.filter(a => (now - a.lastSeen.getTime()) < oneHour);
  const recent = agents.filter(a => (now - a.lastSeen.getTime()) < 6 * oneHour);
  const dormant = agents.filter(a => (now - a.lastSeen.getTime()) > 24 * oneHour);
  
  console.log(`Active (1h): ${active.length}`);
  console.log(`Recent (6h): ${recent.length}`);
  console.log(`Dormant (24h+): ${dormant.length}`);
  
  // unique repos
  const repos = new Set(agents.map(a => a.repoUrl));
  console.log(`Unique Repos: ${repos.size}`);
  
  // most active agents
  console.log('\n--- Most Recent Heartbeats ---');
  const sorted = [...agents].sort((a, b) => b.lastSeen - a.lastSeen);
  sorted.slice(0, 5).forEach(a => {
    const ago = Math.round((now - a.lastSeen.getTime()) / 60000);
    console.log(`  ${a.name} (${ago}m ago) - ${a.wallet.slice(0, 8)}...`);
  });
  
  // agents by repo
  console.log('\n--- Agents by Repo ---');
  const byRepo = {};
  agents.forEach(a => {
    const repo = a.repoUrl.split('/').slice(-2).join('/');
    byRepo[repo] = (byRepo[repo] || 0) + 1;
  });
  Object.entries(byRepo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([repo, count]) => console.log(`  ${repo}: ${count}`));
  
  return {
    total: agents.length,
    active: active.length,
    recent: recent.length,
    dormant: dormant.length,
    agents: sorted
  };
}

// run if called directly
if (require.main === module) {
  analyze().catch(console.error);
}

module.exports = { analyze };