const { sequelize } = require("../models");
const { QueryTypes } = require('sequelize');
class HotelService {
    constructor(db) {
        this.client = db.sequelize;
        this.Hotel = db.Hotel;
    }

    //Create a hotel using raw SQL
    async create(name, location) {
        return this.Hotel.create({ Name: name, Location: location });
    }

    //Get all hotels using raw SQL
    async get() {
        return this.Hotel.findAll();
    }

    //Get hotel details using raw SQL	
    async getHotelDetails(hotelId, userId) {
        //Retrive hotel data
        const hotel = await sequelize.query('SELECT h.id, h.Name, h.Location, ROUND(AVG(r.Value), 1) AS AvgRate FROM Hotels h LEFT JOIN Rates r ON h.id = r.HotelId WHERE h.id = :hotelId', {
            replacements:
            {
                hotelId: hotelId
            },
            type: QueryTypes.SELECT,
        });

        //Retrive user rating count
        const userRateCount = await sequelize.query('SELECT COUNT(*) as Rated FROM Rates WHERE HotelId = :hotelId AND UserId = :userId;', {
            replacements:
            {
                hotelId: hotelId,
                userId: userId
            },
            type: QueryTypes.SELECT,
        });

        //Check if user has rated this hotel.
        if (userRateCount[0].Rated > 0) {
            hotel[0].Rated = true;
        } else {
            hotel[0].Rated = false;
        }

        return hotel[0];
    }

    //Delete a hotel using raw SQL
    async deleteHotel(hotelId) {
        return this.Hotel.destroy({ where: { id: hotelId } });
    }

    //Rate a hotel using raw SQL
    async makeARate(userId, hotelId, value) {
        sequelize.query('INSERT INTO Rates (Value, HotelId, UserId) VALUES (:value, :hotelId, :userId)', {
            replacements:
            {
                userId: userId,
                hotelId: hotelId,
                value: value,
            }
        }).then(result => {
            return result
        }).catch(err => {
            return (err)
        })
    }
}
module.exports = HotelService;
