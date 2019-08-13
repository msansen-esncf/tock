/*
 * Copyright (C) 2017/2019 VSCT
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package fr.vsct.tock.nlp.core.service.entity

import fr.vsct.tock.nlp.core.DictionaryData
import fr.vsct.tock.nlp.core.DictionaryRepository
import fr.vsct.tock.nlp.core.EntityType
import fr.vsct.tock.shared.name
import fr.vsct.tock.shared.namespace

internal object DictionaryRepositoryService : DictionaryRepository {

    @Volatile
    private var dictionaries: Map<String, Map<String, DictionaryData>> = emptyMap()

    @Synchronized
    override fun updateData(data: List<DictionaryData>) {
        val r = mutableMapOf<String, MutableMap<String, DictionaryData>>()
        data.filter { it.values.isNotEmpty() }.forEach {
            r.getOrPut(it.namespace) { mutableMapOf() }[it.entityName] = it
        }
        dictionaries = r
    }

    fun getDictionary(entityType: EntityType): DictionaryData? =
        dictionaries[entityType.name.namespace()]?.get(entityType.name.name())

    fun isSupportedEntityType(namespace: String, name: String): Boolean {
        return dictionaries[namespace]?.containsKey(name) == true
    }
}