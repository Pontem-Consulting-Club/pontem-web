<template>
    <div class="spinner">
        <div class="ring">
            <div class="inner-circle"/>
        </div>
    </div>
</template>

<style scoped>
.spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80vh;
}

.ring {
    width: 100px;
    height: 100px;
    border: 30px solid #00edbf;
    border-radius: 50%;
    position: relative;
    box-shadow: none;
}

.inner-circle {
    width: 40px;
    height: 40px;
    background-color: #ff421d;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) translateX(60px);
    animation: orbit 1.5s linear infinite;
    overflow: hidden;
}

.inner-circle::after {
    content: '';
    width: 100px;
    height: 100px;
    background-color: #3d0784;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) translateX(-60px);
}

@keyframes orbit {
    0% {
        transform: translate(-50%, -50%) rotate(0deg) translateX(60px);
    }

    100% {
        transform: translate(-50%, -50%) rotate(360deg) translateX(60px);
    }
}
</style>