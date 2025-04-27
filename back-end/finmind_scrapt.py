from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

def login_finmind():
    driver = webdriver.Chrome()
    driver.get("https://finmindtrade.com/analysis/#/account/login")
    time.sleep(1)
    driver.find_element(By.ID, "exampleInput1").send_keys("shig378@gmail.com")
    driver.find_element(By.ID, "exampleInput2").send_keys("3SqLirKr5KSL7Xk")
    driver.find_element(By.CSS_SELECTOR, ".btn.btn-primary.btn-lg").click()
    time.sleep(5)
if __name__ == "__main__":
    login_finmind()
