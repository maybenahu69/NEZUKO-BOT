const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "daily",
		version: "2.0",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			en: "Receive daily gift"
		},
		category: "game",
		guide: {
			en: "{pn}\n{pn} info"
		},
		envConfig: {
			rewardFirstDay: {
				coin: 1000,
				exp: 25
			}
		}
	},

	langs: {
		en: {
			monday: "Monday",
			tuesday: "Tuesday",
			wednesday: "Wednesday",
			thursday: "Thursday",
			friday: "Friday",
			saturday: "Saturday",
			sunday: "Sunday",
			alreadyReceived: "You have already received today's gift!",
			received: "🎁 DAILY REWARD\n\n💰 Coin: %1\n⭐ EXP: %2\n\nCome back tomorrow!",
			special: "🌟 SPECIAL BONUS 🌟"
		}
	},

	onStart: async function ({
		args,
		message,
		event,
		envCommands,
		usersData,
		commandName,
		getLang
	}) {
		const reward = envCommands[commandName].rewardFirstDay;

		const now = moment.tz("Asia/Dhaka");
		const dateTime = now.format("DD/MM/YYYY");
		const currentDay = now.day();

		const days = [
			"sunday",
			"monday",
			"tuesday",
			"wednesday",
			"thursday",
			"friday",
			"saturday"
		];

		if (args[0] === "info") {
			let msg = "🎁 DAILY REWARD INFO\n\n";

			for (let i = 0; i < 7; i++) {
				const isSpecial = i === 1 || i === 5;
				const coin = isSpecial ? 3000 : 1000;
				const exp = isSpecial ? 40 : 25;

				msg += `${getLang(days[i])}: ${coin} Coin, ${exp} EXP`;

				if (isSpecial) {
					msg += " 🌟 SPECIAL BONUS";
				}

				msg += "\n";
			}

			return message.reply(msg);
		}

		const { senderID } = event;
		const userData = await usersData.get(senderID);

		if (userData.data.lastTimeGetReward === dateTime) {
			return message.reply(getLang("alreadyReceived"));
		}

		const isSpecial = currentDay === 1 || currentDay === 5;

		const getCoin = isSpecial ? 3000 : reward.coin;
		const getExp = isSpecial ? 40 : reward.exp;

		userData.data.lastTimeGetReward = dateTime;

		await usersData.set(senderID, {
			money: userData.money + getCoin,
			exp: userData.exp + getExp,
			data: userData.data
		});

		const reply = isSpecial
			? `${getLang("special")}\n\n${getLang("received", getCoin, getExp)}`
			: getLang("received", getCoin, getExp);

		return message.reply(reply);
	}
};
