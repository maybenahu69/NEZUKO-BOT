const OWNER_ID = "61591523254564";

module.exports = {
    config: {
        name: "set",
        version: "2.1",
        author: "NAH!D",
        countDown: 5,
        role: 0,
        description: {
            bn: "Owner দ্বারা Money সেট করার কমান্ড",
            en: "Set user money (Owner only)"
        },
        category: "economy",
        guide: {
            bn: "{pn} money 100M [UID/@tag]",
            en: "{pn} money 100M [UID/@tag]"
        }
    },

    onStart: async function ({
        event,
        args,
        usersData,
        message
    }) {

        // OWNER CHECK
        if (String(event.senderID) !== OWNER_ID) {
            return message.reply(
                "❌ Only Bot Owner can use this command!"
            );
        }

        // COMMAND CHECK
        if (
            !args[0] ||
            args[0].toLowerCase() !== "money" ||
            !args[1]
        ) {
            return message.reply(
                "Usage:\n" +
                "!set money 100M\n" +
                "!set money 100M @tag\n" +
                "!set money 100M UID\n" +
                "Reply: !set money 100M"
            );
        }

        // AMOUNT CONVERSION
        const input = args[1].toUpperCase();

        const match = input.match(
            /^(\d+(?:\.\d+)?)([KMBT]?)$/
        );

        if (!match) {
            return message.reply(
                "❌ Invalid Amount!\n" +
                "Examples: 100M, 50K, 2B, 1T"
            );
        }

        const number = Number(match[1]);

        const units = {
            "": 1,
            K: 1000,
            M: 1000000,
            B: 1000000000,
            T: 1000000000000
        };

        const amount = number * units[match[2]];

        if (
            !Number.isSafeInteger(amount) ||
            amount < 0
        ) {
            return message.reply(
                "❌ Invalid or too large amount!"
            );
        }

        // TARGET SELECTION
        const mentions = Object.keys(event.mentions || {});
        const extra = args.slice(2);

        let targetID = null;

        // 1. TAG / MENTION
        if (mentions.length > 0) {
            targetID = mentions[0];
        }

        // 2. UID
        if (!targetID && extra.length > 0) {
            if (/^\d+$/.test(extra[0])) {
                targetID = extra[0];
            }
        }

        // 3. REPLY
        if (
            !targetID &&
            event.messageReply &&
            event.messageReply.senderID
        ) {
            targetID = String(
                event.messageReply.senderID
            );
        }

        // 4. DEFAULT SELF
        if (!targetID) {
            targetID = String(event.senderID);
        }

        // UPDATE MONEY
        try {
            await usersData.set(
                targetID,
                "money",
                amount
            );

            return message.reply(
                "✅ MONEY UPDATED SUCCESSFULLY!\n\n" +
                `👤 Target UID: ${targetID}\n` +
                `💰 New Balance: ${input}\n` +
                `🔢 Exact Amount: ${amount.toLocaleString("en-US")}\n\n` +
                "⚡ Updated by: NAH!D"
            );

        } catch (error) {
            console.error("SetMoney Error:", error);

            return message.reply(
                "❌ Failed to update Money!\n" +
                "Please check database configuration."
            );
        }
    }
};
