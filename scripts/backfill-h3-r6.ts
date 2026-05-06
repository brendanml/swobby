import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"
import { latLngToCell } from "h3-js"

config()

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const H3_RESOLUTION = 6
const BATCH_SIZE = 500

async function backfill() {
    let offset = 0
    let total = 0

    while (true) {
        const { data, error } = await supabase
            .from("profiles")
            .select("id, lat, lng")
            .not("lat", "is", null)
            .not("lng", "is", null)
            .is("h3_r6", null)
            .range(offset, offset + BATCH_SIZE - 1)

        if (error) throw error
        if (!data?.length) break

        const updates = data.map((p) => ({
            id: p.id,
            h3_r6: latLngToCell(p.lat, p.lng, H3_RESOLUTION),
        }))

        for (const update of updates) {
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ h3_r6: update.h3_r6 })
                .eq("id", update.id)
            if (updateError) throw updateError
        }

        total += data.length
        console.log(`Updated ${total} profiles...`)

        if (data.length < BATCH_SIZE) break
        offset += BATCH_SIZE
    }

    console.log(`Done. Backfilled ${total} profiles.`)
}

backfill().catch((err) => {
    console.error(err)
    process.exit(1)
})
