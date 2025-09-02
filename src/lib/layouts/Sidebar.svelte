<aside id="sidebar">
    <section class="title">
        <h1>Chasqui</h1>
    </section>

    <section class="new-actions">
        <button id="new-request">New Request</button>
        <button id="new-dropdown">+</button>
    </section>
</aside>

<style>
    #sidebar {
        width: 100%;
        min-height: max-content;
        padding: 20px 20px;
    }

    .title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 20px;
        margin-bottom: 30px;
    }

    .title h1 {
        padding: 0;
        margin: 0;
        font-size: 32px;
    }

    .new-actions {
        display: flex;
        gap: 4px;
        align-items: center;
    }

    #new-request {
        flex: 1;
    }
</style>
