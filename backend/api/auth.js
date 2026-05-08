const router = require("express").Router();
const passport = require("passport");

router.get("/login/success", (req, res) => {
	if (req.user) {
		res.send({
			status: 200,
			error: false,
			message: "Successfully Loged In",
			user: req.user,
		});
	} else {
		res.send({ error: true, message: "Not Authorized" });
	}
});

router.get("/login/failed", (req, res) => {
	res.send({
		error: true,
		message: "Log in failure",
	});
});

router.get("/google", passport.authenticate("google", ["profile", "email"]));

router.get(
	"/google/callback",
	passport.authenticate("google", {
		successRedirect: process.env.CLIENT_URL || "http://localhost:3000/",
		failureRedirect: "/login/failed",
	})
);

router.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) {
            return res.json({ error: true, message: err.message });
        }
        req.session.destroy((err) => {
            if (err) console.log(err);
        });
        res.clearCookie('connect.sid');
        res.json({ status: 200, message: "Logged out successfully" });
    });
});

module.exports = router;
