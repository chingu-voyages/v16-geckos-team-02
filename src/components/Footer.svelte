

<footer id="footer">
    <img src="/images/logo.svg" alt="Dashy" />
    <a href="https://github.com/chingu-voyages/v16-geckos-team-02">
        <div>about</div>
        <div class="v16">v16<br/>-geckos-<br/>02</div>
        <div><span>GitHub</span><br/>repo</div>
    </a>
</footer>

<style>
    footer {
        width: 100%;
        height: 220px;
        display: grid;
        place-items: center center;
        background: #ACACAC;
    }
    img {
        max-width: 100%;
    }
    a {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        place-items: center center;
        color: #3A3A3A;
        width: 300px;
        max-width: 100vw;
        text-align: center;
        font-size: 18px;
        font-weight: 600;
        text-decoration: underline;
    }
    .v16 {
        font-size: 16px;
    }
    span {
        font-size: 11px;
    }
</style>