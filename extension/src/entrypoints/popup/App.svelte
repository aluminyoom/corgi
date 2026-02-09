<script lang="ts">
  function openSettings() {
    browser.tabs.create({ url: 'https://kagi.com/settings/corgi' });
    window.close();
  }
</script>

<main>
  <header>
    <h1>Corgi</h1>
  </header>
  <p>Manage themes and plugins from Kagi settings.</p>
  <button onclick={() => openSettings()}>Open Settings</button>
</main>

<style>
  main {
    width: 240px;
    padding: 16px;
    font-family: system-ui, -apple-system, sans-serif;
    color: #e0e0e0;
    background: #1a1a2e;
    text-align: center;
  }

  h1 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 8px;
  }

  p {
    font-size: 13px;
    color: #888;
    margin: 0 0 12px;
  }

  button {
    width: 100%;
    padding: 8px;
    border-radius: 6px;
    border: 1px solid #333;
    background: #4a6cf7;
    color: #fff;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.15s;
  }

  button:hover {
    background: #3a5ce0;
  }
</style>
