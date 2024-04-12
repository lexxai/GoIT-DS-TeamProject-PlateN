import time
import argparse


from telegram_api import crone_pool, send_message_news


def handler_telegram_pool(print_log: bool = False):
    if print_log:
        print("- handler_telegram_pool")
    crone_pool()


def handler_limit_check(print_log: bool = False):
    if print_log:
        print("- handler_limit_check")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Infinite loop of service app events")
    parser.add_argument("--loop", action="store_true")
    parser.add_argument(
        "--delay", type=int, default=1, help="loop delay in seconds, default 1 sec"
    )
    parser.add_argument(
        "-t",
        "--telegram_period",
        type=int,
        default=2,
        help="Telegram bot pool period in seconds, default 2 sec",
    )
    parser.add_argument(
        "-l",
        "--limit_period",
        type=int,
        default=300,
        help="Limit Check period in seconds, default 300 sec",
    )
    parser.add_argument("-q", "--quite", action="store_true", help="Quite")
    args = parser.parse_args()

    if args.loop:
        loop_delay = args.delay
        time_now = time.time()
        periods = {
            "telegram_pool": args.telegram_period,
            "limit_check": args.limit_period,
        }
        actions = {
            "telegram_pool": handler_telegram_pool,
            "limit_check": handler_limit_check,
        }

        times = {period_name: time_now for period_name in periods.keys()}
        print_log = not args.quite
        send_message_news(
            "Hosting server just applied new changes of git branch at: <datetime>"
        )
        try:
            while True:
                time_now = time.time()

                deltas: dict = {
                    period_name: time_now - times[period_name]
                    for period_name in periods.keys()
                }
                for period_name in periods.keys():
                    if deltas[period_name] > periods[period_name]:
                        times[period_name] = time_now
                        actions[period_name](print_log)
                if print_log:
                    print(f"Loop... {loop_delay}")
                time.sleep(loop_delay)
        except KeyboardInterrupt:
            print("*** Terminated by user pressing: Ctrl-C")
